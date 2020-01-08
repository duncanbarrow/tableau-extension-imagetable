'use strict';

(function () {
    $(document).ready(function () {
        tableau.extensions.initializeDialogAsync().then(function (openPayload) {
            buildDialog();
        });
    });

    // build the dialog box and ensure settings are read from the
    // UI namespace and the UI is updated
    function buildDialog() {
        var worksheetName = tableau.extensions.settings.get("worksheet");
        

        // populate the worksheet drop down
        let dashboard = tableau.extensions.dashboardContent.dashboard;
        dashboard.worksheets.forEach(function (worksheet) {
            if (worksheetName != undefined && worksheet.name == worksheetName) {
                $("#sheetList").append("<option value='" + worksheet.name + "' selected='true'>" + worksheet.name + "</option>");
            } else {
                $("#sheetList").append("<option value='" + worksheet.name + "'>" + worksheet.name + "</option>");
            }
        });

        $("#showLabel").click(function() {
            if(this.checked == true) {
                $("#labelField").removeAttr("disabled");
                $("#lblHorAllign").removeAttr("disabled");
                $("#lblVerAllign").removeAttr("disabled");
            } else {
                $("#labelField").attr("disabled",true);
                $("#lblHorAllign").attr("disabled",true);
                $("#lblVerAllign").attr("disabled",true);
            }
        });


        if (worksheetName != undefined) {
            fieldListUpdate(worksheetName);

            // show label check box
            $("#showLabel").removeAttr("disabled");
            var showLabel = tableau.extensions.settings.get("showLabel");
            if (showLabel != undefined && showLabel == "Y") {
                $("#showLabel").attr("checked",true);
                $("#labelField").removeAttr("disabled");
                $("#lblHorAllign").removeAttr("disabled");
                $("#lblVerAllign").removeAttr("disabled");
            }

            var lblHorAllign = tableau.extensions.settings.get("lblHorAllign");
            var lblVerAllign = tableau.extensions.settings.get("lblVerAllign");

            if (lblHorAllign != undefined) {
                $("#lblHorAllign").val(lblHorAllign);
            }

            if (lblVerAllign != undefined) {
                $("#lblVerAllign").val(lblVerAllign);
            }

        }

        // reset field list on worksheet change
        $("#sheetList").on('change','', function() {
            var wsheetName = $("#sheetList").val();
            fieldListUpdate(wsheetName);

            // reset show label check box
            var showLabelCB = document.getElementById("showLabel");
            showLabelCB.checked = false;
            
            $("#showLabel").removeAttr("disabled");
            $("#lblHorAllign").removeAttr("disabled");
            $("#lblVerAllign").removeAttr("disabled");

        });

        // enable action field list if action is chosen
        $("#dbAction").on('change','', function() {
            if ($("#dbAction").val() != "none") {
                $("#actionField").removeAttr("disabled");
                $("#parameterSet").removeAttr("disabled");
                parameterListUpdate();
            } else {
                $("#actionField").attr("disabled","true");
                $("#parameterSet").attr("disabled","true");
            }
        })

        // set button functions
        $('#cancelButton').click(closeDialog);
        $('#saveButton').click(saveButton);
    }

    function parameterListUpdate() {
        var dbAction = tableau.extensions.settings.get("dbAction");
        var parameterSet = tableau.extensions.settings.get("parameterSet");

        // populate list of parameters
        if ((dbAction != undefined && dbAction != "none") || $("#dbAction").val() != "none") {
            tableau.extensions.dashboardContent.dashboard.getParametersAsync().then(function (parameters) {
                $("#parameterSet").text("");
                $("#parameterSet").append("<option disabled='true' selected='true'>-- Select the parameter/set to be changed by the action --</option>");
                parameters.forEach(function (current_param) {
                    if (parameterSet != undefined && parameterSet == current_param.name) {
                        $("#parameterSet").append("<option value='" + current_param.name + "' selected='true'>" + current_param.name +"</option>");
                    } else {
                        $("#parameterSet").append("<option value='" + current_param.name + "'>" + current_param.name +"</option>");
                    }
                });
             });
        } 
    }


    function fieldListUpdate(worksheetName) {
        // populate field names and select chosen value if it exists
        var urlField = tableau.extensions.settings.get("urlField");
        var labelField = tableau.extensions.settings.get("labelField");
        var actionField = tableau.extensions.settings.get("actionField");
        var dbAction = tableau.extensions.settings.get("dbAction");

        var dashboard = tableau.extensions.dashboardContent.dashboard;
        var worksheet = dashboard.worksheets.find(function (sheet) {
            return sheet.name === worksheetName;
        });

        worksheet.getSummaryDataAsync({ maxRows: 1}).then(function (sumdata) {
            var worksheetColumns = sumdata.columns;
            // image URL Field List
            $("#imageUrlField").text("");
            $("#imageUrlField").append("<option disabled='true' selected='true'>-- Select the field with the image URL --</option>");

            // label Field List
            $("#labelField").text("");
            $("#labelField").append("<option disabled='true' selected='true'>-- Select the field with the image label --</option>");

            // loop over each column
            worksheetColumns.forEach(function (current_value) {
                
                // image URL field list
                if (urlField != undefined && current_value.fieldName == urlField) {
                    $("#imageUrlField").append("<option value='" + current_value.fieldName + "' selected='true'>" + current_value.fieldName + "</option>");
                } else {
                    $("#imageUrlField").append("<option value='" + current_value.fieldName + "'>" + current_value.fieldName + "</option>");
                }

                // label field list
                if (labelField != undefined && current_value.fieldName == labelField) {
                    $("#labelField").append("<option value='" + current_value.fieldName + "' selected='true'>" + current_value.fieldName + "</option>");
                } else {
                    $("#labelField").append("<option value='" + current_value.fieldName + "'>" + current_value.fieldName + "</option>");
                }

                // action field list
                if (actionField != undefined && current_value.fieldName == actionField) {
                    $("#actionField").append("<option value='" + current_value.fieldName + "' selected='true'>" + current_value.fieldName + "</option>");
                } else {
                    $("#actionField").append("<option value='" + current_value.fieldName + "'>" + current_value.fieldName + "</option>");
                }
            });

        });

        

        $("#imageUrlField").removeAttr("disabled");
        //$("#labelField").removeAttr("disabled");
        if (dbAction != undefined && dbAction != "none") {
            $("#actionField").removeAttr("disabled");
        }
    }

    function closeDialog() {
        tableau.extensions.ui.closeDialog("10");
    }

    function saveButton() {
        // save settings
        tableau.extensions.settings.set("worksheet", $("#sheetList").val());
        tableau.extensions.settings.set("urlField", $("#imageUrlField").val());
        if ($("#labelField").val()) {
            tableau.extensions.settings.set("labelField", $("#labelField").val());
        } else {
            tableau.extensions.settings.erase("labelField");
        }

        if ($("#lblVerAllign").val()) {
            tableau.extensions.settings.set("lblVerAllign", $("#lblVerAllign").val());
        } else {
            tableau.extensions.settings.erase("lblVerAllign");
        }

        if ($("#lblHorAllign").val()) {
            tableau.extensions.settings.set("lblHorAllign", $("#lblHorAllign").val());
        } else {
            tableau.extensions.settings.erase("lblHorAllign");
        }

        if (document.getElementById("showLabel").checked == true) {
            tableau.extensions.settings.set("showLabel", "Y");
            
        } else {
            tableau.extensions.settings.set("showLabel", "N");
            tableau.extensions.settings.erase("labelField");
            tableau.extensions.settings.erase("lblVerAllign");
            tableau.extensions.settings.erase("lblHorAllign");
        }

        tableau.extensions.settings.set("dbAction",$("#dbAction").val());

        if ($("#dbAction").val() != "none") {
            tableau.extensions.settings.set("actionField",$("#actionField").val());
            tableau.extensions.settings.set("parameterSet",$("#parameterSet").val());
        } else {
            tableau.extensions.settings.erase("actionField");
            tableau.extensions.settings.erase("parameterSet");
        }


        // call saveAsync to save settings before calling closeDialog
        tableau.extensions.settings.saveAsync().then((currentSettings) => {
            tableau.extensions.ui.closeDialog("10");
        });
    }
})();