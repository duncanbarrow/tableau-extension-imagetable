'use strict';

(function() {
    // vars to hold ref to the unregister event listener functions
    let unregisterSettingsEventListener = null;
    let unregisterFilterEventListener = null;
    let unregisterMarkSelectionListener = null;
    let unregisterParameterEventListener = null;

    $(document).ready(function () {
        // add configure option to call the configure function
        // when we invoke this action on the user interface
        tableau.extensions.initializeAsync({ 'configure': configure }).then(function () {
            // calls a function to show the table
            renderImageTable();

            // add settings and parameter listeners
            unregisterSettingsEventListener = tableau.extensions.settings.addEventListener(tableau.TableauEventType.SettingsChanged, (settingsEvent) => {
                renderImageTable();
            });
            tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(function (parameters) {
                parameters.forEach(function (p) {
                    p.addEventListener(tableau.TableauEventType.ParameterChanged, (filterEvent) => {
                        renderImageTable();
                    });
                });
            });
        }, function() {console.log('Error while Initializing: ' + err.toString());});
    });

    // main function to render image table
    function renderImageTable() {
        $("#imagetable").text("");
        const worksheets = tableau.extensions.dashboardContent.dashboard.worksheets;

        // unregister Event Listeners for old worksheet, if exists
        if (unregisterFilterEventListener != null) {
            unregisterFilterEventListener();
        }
        if (unregisterMarkSelectionListener != null) {
            unregisterMarkSelectionListener();
        }

        // try to get worksheet from settings, if it doesn't exist will show message saying to configure
        // else will hide the configuration instructions
        var sheetName = tableau.extensions.settings.get("worksheet");
        if (sheetName == undefined || sheetName == "" || sheetName == null) {
            $("#configure").show();
            
            // exit the function as there is no configuration
            return;
        } else {
            // if configuration exists then hide the config message
            $("#configure").hide();
        }

        // get the worksheet object from the worksheet name
        var worksheet = worksheets.find(function (sheet) {
            return sheet.name === sheetName;
        });

        // Add event listeners to the worksheet
        unregisterFilterEventListener = worksheet.addEventListener(tableau.TableauEventType.FilterChanged, (filterEvent) => {
            renderImageTable();
        });
        unregisterMarkSelectionListener = worksheet.addEventListener(tableau.TableauEventType.MarkSelectionChanged, (markSelectionEvent) => {
            renderImageTable();
        });
        
        var urlField = tableau.extensions.settings.get("urlField");
        var labelField = tableau.extensions.settings.get("labelField");
        var showLabel = tableau.extensions.settings.get("showLabel");
        var lblVerAllign = tableau.extensions.settings.get("lblVerAllign");
        var lblHorAllign = tableau.extensions.settings.get("lblHorAllign");
        var dbAction = tableau.extensions.settings.get("dbAction");
        var actionField = tableau.extensions.settings.get("actionField");

        if (urlField != undefined) {
            worksheet.getSummaryDataAsync().then(function (sumdata) {
                var urlFieldSD = sumdata.columns.find(column => column.fieldName === urlField);
                var labelFieldSD = "";
                if (showLabel == "Y") {
                    labelFieldSD = sumdata.columns.find(column => column.fieldName === labelField);
                }
                var actionFieldSD = "";
                if (dbAction != "none") {
                    actionFieldSD = sumdata.columns.find(column => column.fieldName === actionField);
                }
                
                //var urlList = [];
                for (var row of sumdata.data) {
                    //urlList.push(row[urlFieldSD.index].value);
                    if (showLabel == "N") {
                        if (dbAction != "none" && actionFieldSD != "") {
                            $("#imagetable").append("<tr><td><img style='display:block;' width='100%' height='auto' alt='" + row[actionFieldSD.index].value +"' src='" + row[urlFieldSD.index].value + "' onclick='updateParam(this)'></td></tr>");
                        } else {
                            $("#imagetable").append("<tr><td><img style='display:block;' width='100%' height='auto' src='" + row[urlFieldSD.index].value + "'></td></tr>");
                        }
                    }
                    else if (showLabel == "Y" && lblVerAllign == "top") {
                        if (dbAction != "none" && actionFieldSD != "") {
                            $("#imagetable").append("<tr><td><label width='100%' style='display:block; text-align:" + lblHorAllign + ";'>" + row[labelFieldSD.index].value + "</label><br/><img style='display:block;' width='100%' height='auto' alt='" + row[actionFieldSD.index].value +"' src='" + row[urlFieldSD.index].value + "' onclick='updateParam(this)'></td></tr>");
                        } else {
                            $("#imagetable").append("<tr><td><label width='100%' style='display:block; text-align:" + lblHorAllign + ";'>" + row[labelFieldSD.index].value + "</label><br/><img style='display:block;' width='100%' height='auto' src='" + row[urlFieldSD.index].value + "'></td></tr>");
                        }
                    }
                    else if (showLabel == "Y" && lblVerAllign == "bottom") {
                        if (dbAction != "none" && actionFieldSD != "") {
                            $("#imagetable").append("<tr><td><img style='display:block;' width='100%' height='auto' alt='" + row[actionFieldSD.index].value +"' src='" + row[urlFieldSD.index].value + "' onclick='updateParam(this)'><br/><label width='100%' style='display:block; text-align:" + lblHorAllign + ";'>" + row[labelFieldSD.index].value + "</label></td></tr>");
                        } else {
                            $("#imagetable").append("<tr><td><img style='display:block;' width='100%' height='auto' src='" + row[urlFieldSD.index].value + "'><br/><label width='100%' style='display:block; text-align:" + lblHorAllign + ";'>" + row[labelFieldSD.index].value + "</label></td></tr>");
                        }
                    }
                }
            });
        }
    }

    

    // configuration button
    function configure() {
        const popupUrl = `${window.location.href.replace(/[^/]*$/, '')}/dialog.html`;

        let input = "";

        tableau.extensions.ui.displayDialogAsync(popupUrl, input, {height: 540, width: 950}).then((closePayload) => {
            // the close payload is returned rom the popup extension via the closeDialog method
            $('#interval').text(closePayload);
        }).catch((error) => {
            // one expected error condition is when the popup is closed by the user (clicking on the 'x')
            switch (error.errorCode) {
                case tableau.ErrorCodes.DialogClosedByUser:
                    console.log("Dialog was closed by user");
                    break;
                default:
                    console.log(error.message);
            }
        });
    }
})();