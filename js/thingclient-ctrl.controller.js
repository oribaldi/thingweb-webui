angular.module("thingclient").controller('ThingClientCtrl',
    ['$scope', '$interval', '$http' , '$mdSidenav', '$mdDialog', '$mdToast', 'TdParser', 'ThingClient', 'CoAP',
        function ThingClientCtrl($scope, $interval, $http ,$mdSidenav, $mdDialog, $mdToast, TdParser, ThingClient) {
            var self = this;
            $scope.things = [];
            self.selected = {};
            self.autoReloaded = [];
            $scope.isGeneral = true;
            
            // ### Thingweb Repo only ###
            var source;
            $scope.noThings = true;
            // For the queries
            $scope.queryType    = "sparql";
            $scope.placeholder  = '?s ?p ?o.';
            $scope.queryContent = "";
            // ##########################
            
            var showRestError = function showRestError(errorObj) {
                msg = errorObj.config.method + " to " + errorObj.config.url + " failed.<br/>";
                msg += errorObj.status + " " + errorObj.statusText
                showError(msg);
            }

            var showError = function showError(errorMsg) {
                $mdToast.showSimple(errorMsg);
            }

            var reloadAuto = function reloadAuto() {
                self.autoReloaded.forEach(function(property) {
                    ThingClient.readProperty(property.parent, property).catch(showRestError);
                });
            }
            self.minMax= function minMax(min,max){
                if (min!= null && max!=null){
                    return "(min="+min+",max="+max+")";
                }
                else return null;
            }
            self.setType= function setType(type){
                if (type=="number"|| type=="integer") {
                    return "number";
                }
                else if (type== "string") {
                    return "text";
                }

            }

            $interval(reloadAuto, 1000);

            self.addThingFromUrl = function addThingFromUrl(url) {
                TdParser.fromUrl(url).then(self.addThing).catch(showRestError);
            }

            self.addThingFromJson = function addThingFromJson(json) {
                self.addThing(TdParser.parseJson(json));
            }
            
            self.addThingFromObject = function addThingFromObject(td) {
            	console.log(td);
                self.addThing(TdParser.createThing(td));
            }

            self.addThing = function addThing(thing) {
                $scope.things.push(thing);
                self.selected = thing;
            }

            self.updateState = function updateState() {
                self.selected.properties.forEach(function(property) {
                    ThingClient.readProperty(self.selected, property).catch(showRestError);
                });
            }

            self.readProperty = function readProperty(property) {
                ThingClient.readProperty(self.selected, property).catch(showRestError);
            }

            self.writeProperty = function writeProperty(property) {
                ThingClient.writeProperty(self.selected, property).catch(showRestError);
            }

            self.callAction = function callAction(action, param) {
                ThingClient.callAction(self.selected, action, param).catch(showRestError);
            }

            self.toggleList = function toggleList() {
                $mdSidenav('left').toggle()
            };

            self.selectThing = function selectThing(thing) {
                self.selected = thing;
            };

            self.openUriDialog = function openUriDialog($event) {
                $mdDialog.show({
                    clickOutsideToClose: true,
                    controller: function($mdDialog) {
                        // Save the clicked item
                        this.uri = "";
                        // Setup some handlers
                        this.close = function() {
                            $mdDialog.cancel();
                        };
                        this.submit = function() {
                            $mdDialog.hide();
                            self.addThingFromUrl(this.uri);
                        };
                    },
                    controllerAs: 'dialog',
                    templateUrl: 'uridialog.html',
                    targetEvent: $event
                });
            }

            self.addFileFromPicker = function addFileFromPicker(filePickerId) {
                angular.element(document.querySelector('#' + filePickerId))[0].click();
            }

            self.toggleAuto = function toggleAuto(property) {
                property.autoUpdate = !property.autoUpdate;
                if (property.autoUpdate) {
                    self.autoReloaded.push(property);
                } else {
                    var idx = autoReloaded.indexOf(property);
                    if (idx > -1)
                        self.autoReloaded.splice(idx, 1); //remove property
                }
            }
            
            self.addCatalog = function addCatalog($event) {
                $mdDialog.show({
                    clickOutsideToClose: true,
                    controller: function($mdDialog) {
                        // Save the clicked item
                        this.uri = "";
                        // Setup some handlers
                        this.close = function() {
                            $mdDialog.cancel();
                        };
                        this.submit = function() {
                            
                            // Validate uri
                            var URL_REGEXP = /^(http?|coap)s?:\/\/(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:\/?|[\/?]\S+)$/gi;
                            if (URL_REGEXP.test(this.uri)) {
                            	
                            	$mdDialog.hide();
                            	
                            	$http.get(this.uri)
                                .then(function(response) {
                                    var catalog = response.data;
                                    console.log(catalog);
                                    for(var name in catalog) {
                                        console.log("found " + name);
                                        self.addThingFromObject(catalog[name]);    
                                    }
                                })
                                .catch(showRestError);
                            	
                            } else {
                            	alert("Not a valid URL, please try again!");
                            }
                            
                        };
                    },
                    controllerAs: 'dialog',
                    templateUrl: 'uridialog.html',
                    targetEvent: $event
                });
            }
            
            self.addThingwebRepo = function addThingWebRepo($event) {
            		
            	$mdDialog.show({
                    clickOutsideToClose: true,
                    controller: function($mdDialog) {
                        // Save the clicked item
                        this.uri = "";
                        // Setup some handlers
                        this.close = function() {
                            $mdDialog.cancel();
                        };
                        this.submit = function() {
                        	
                        	// Validate uri
                            var URL_REGEXP = /^(coap)s?:\/\/(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:\/?|[\/?]\S+)$/gi;
                            if (URL_REGEXP.test(this.uri)) {
                            	
                            	$mdDialog.hide();
                            	
                            	// Setup server event
                                source = new EventSource('/loadTD');
                                source.addEventListener('observing', function (event) {
                                	
                                	$scope.$apply(function () {

                                		$scope.things = [];
                                		$scope.isGeneral = false;
                                		
                                		var catalog = JSON.parse(event.data);
                                		for (var name in catalog) {
                                			console.log("found " + name);
                                			self.addThingFromObject(catalog[name]);
                                		}
                                		
                                		self.selected = {};
                                		
                                		if ($scope.things.length !== 0) {
                        					$scope.noThings = false;
                        				} else {
                        					$scope.Things = true;
                        				}
                                	});
                                }, false);
                            	
                            } else {
                            	alert("Not a valid CoAP URL, please try again!");
                            }    
                        };
                    },
                    controllerAs: 'dialog',
                    templateUrl: 'uridialog.html',
                    targetEvent: $event
                });
            	
            	
            }
            
            // Filter TDs by semantic queries
            $scope.sendQuery = function () {
            	
            	var params = '?queryType=' + $scope.queryType + "&queryContent=" + $scope.queryContent;
            	self.selected = {};

            	$http({
          		  method: 'GET',
          		  url: '/searchTD' + params
            	}).then(
            			function successCallback(response) {
            				
            				$scope.queryContent = '';
            				$scope.things = [];
            				var catalog = response.data;
            				for (var name in catalog) {
                    			console.log("found " + name);
                    			self.addThingFromObject(catalog[name]);
                    		}
            			},
            			function errorCallback(response){
            				// failure callback,handle error here
            				console.log('error');
            			}
            	).catch(showRestError);;
			};
			
			/* Updates the hint for the query, according to the
			 * selected search type. Sparql (1), Text (2).
			 */
			$scope.radioChecked = function radioChecked(type) {
				
				if (type == 1) {
					$scope.placeholder = '?s ?p ?o.';
				} else {
					$scope.placeholder = 'word1 AND word2';
				}
				$scope.apply();
			};

            return self;
        }
    ]
);
