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

        // set button functions
        $('#cancelButton').click(closeDialog);
        $('#saveButton').click(saveButton);
    }


    function fieldListUpdate(worksheetName) {
        // populate field names and select chosen value if it exists
        var urlField = tableau.extensions.settings.get("urlField");
        var labelField = tableau.extensions.settings.get("labelField");
        var worksheet = tableau.extensions.dashboardContent.dashboard.worksheets.find(function (sheet) {
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
            });

        });

        $("#imageUrlField").removeAttr("disabled");
        //$("#labelField").removeAttr("disabled");
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


        // call saveAsync to save settings before calling closeDialog
        tableau.extensions.settings.saveAsync().then((currentSettings) => {
            tableau.extensions.ui.closeDialog("10");
        });
    }
})();