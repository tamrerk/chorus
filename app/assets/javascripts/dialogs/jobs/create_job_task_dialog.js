chorus.dialogs.CreateJobTask = chorus.dialogs.Base.include(chorus.Mixins.DialogFormHelpers).extend({
    constructorName: 'CreateJobTask',
    templateName: 'create_job_task_dialog',
    title: t('create_job_task_dialog.title'),
    message: "create_job_task_dialog.toast",

    events: {
        "change select.action": "toggleTaskConfiguration",
        "change input:radio": "onExistingTableChosenAsDestination",
        "change input:checkbox": "onCheckboxClicked",
        "click .source a.dataset_picked": "launchSourceDatasetPickerDialog",
        "click .destination a.dataset_picked": "launchDestinationDatasetPickerDialog"
    },

    setup: function () {
        this.job = this.options.job;
        this.workspace = this.job.workspace();
        this.model = new chorus.models.JobTask({workspace: {id: this.workspace.get("id")}, job: {id: this.options.job.get("id")}});

        this.disableFormUnlessValid({
            formSelector: "form",
            inputSelector: "input",
            checkInput: _.bind(this.checkInput, this)
        });

        this.listenTo(this.model, "saved", this.modelSaved);
    },

    postRender: function () {
        this.updateExistingTableLink();

        _.defer(_.bind(function () {
            chorus.styleSelect(this.$("select"));
        }, this));
    },

    checkInput: function () {
        var importIntoExisting = this.$(".choose_table input:radio").prop("checked");
        var newTableNameGiven = this.$('input.new_table_name').val().trim().length > 0;

        var existingDestinationPicked = importIntoExisting && this.destinationTableHasBeenPicked;
        var newDestinationNamed = (!importIntoExisting && newTableNameGiven);

        var sourcePicked = this.sourceTableHasBeenPicked;
        var destinationPicked = existingDestinationPicked || newDestinationNamed;

        var validLimit = this.limitIsChecked() ? this.limitIsValid() : true;
        return sourcePicked && destinationPicked && validLimit;
    },

    isNewTable: function () {
        return this.$('.new_table input:radio').prop('checked');
    },

    onExistingTableChosenAsDestination: function () {
        this.clearErrors();
        this.updateExistingTableLink();
    },

    updateExistingTableLink: function () {
        var destinationIsNewTable = this.$(".new_table input:radio").prop("checked");

        var $tableNameField = this.$(".new_table input.new_table_name");
        $tableNameField.prop("disabled", !destinationIsNewTable);

        this.$(".truncate").prop("disabled", this.isNewTable());

        this.enableDestinationLink(!destinationIsNewTable);
        this.showErrors(this.model);
        this.toggleSubmitDisabled();
    },

    enableDestinationLink: function (enable) {
        var $a = this.$(".destination a.dataset_picked");
        var $span = this.$(".destination span.dataset_picked");

        if (enable) {
            $a.removeClass("hidden");
            $span.addClass("hidden");
        } else {
            $a.addClass("hidden");
            $span.removeClass("hidden");
        }
    },

    sourceTableHasBeenPicked: false,
    destinationTableHasBeenPicked: false,

    limitIsChecked: function () {
        return this.$("input[name=limit_num_rows]").prop("checked");
    },

    truncateIsChecked: function () {
        return this.$("input.truncate").prop("checked");
    },

    newTableName: function () {
        return this.$('input.new_table_name').val();
    },

    limitIsValid: function () {
        var limit = parseInt(this.$(".limit input[type=text]").val(), 10);

        return isNaN(limit) ? false : limit > 0;
    },

    onCheckboxClicked: function (e) {
        this.$(".limit input:text").prop("disabled", !this.limitIsChecked());
        this.toggleSubmitDisabled();
    },

    toggleTaskConfiguration: function (e) {
        var selectedAction = this.$('select.action').val();
        this.$('.import').toggleClass('hidden', (selectedAction !== 'import_source_data'));
    },

    datasetsChosen: function (datasets, source_or_destination) {
        if (source_or_destination === 'destination') {
            this.destinationTableHasBeenPicked = true;
            this.selectedDestinationDatasetId = datasets[0].get("id");
        }
        if (source_or_destination === 'source') {
            this.sourceTableHasBeenPicked = true;
            this.selectedSourceDatasetId = datasets[0].get("id");
        }

        var selector = '.' + source_or_destination;
        this.changeSelectedDataset(datasets && datasets[0] && datasets[0].name(), selector);
    },

    changeSelectedDataset: function (name, target) {
        if (name) {
            this.$(target + " a.dataset_picked").text(_.prune(name, 20));
            this.$(target + " span.dataset_picked").text(_.prune(name, 20));
            this.toggleSubmitDisabled();
        }
    },

    create: function () {
        this.$("button.submit").startLoading('actions.saving');
        this.model.save(this.fieldValues(), {wait: true});
    },

    modelSaved: function () {
        chorus.toast(this.message);
        this.model.trigger('invalidated');
        this.job.trigger('invalidated');
        this.closeModal();
    },

    fieldValues: function () {
        var action = this.$("select.action").val();
        var updates = {};

        if(action === "import_source_data") {
            updates.action = action;
            updates.sourceId = this.selectedSourceDatasetId;
            updates.destinationId = this.selectedDestinationDatasetId;

            if (this.isNewTable()) {
                updates.destinationName = this.newTableName();
            } else {
                updates.destinationId = this.selectedDestinationDatasetId;
            }
            updates.rowLimit = this.limitIsChecked() ? this.$("input.row_limit").val() : '';
            updates.truncate = this.truncateIsChecked();
        }

        return updates;
    },

    launchDatasetPickerDialog: function (e, source_or_destination) {
        e.preventDefault();
        if (this.saving) {
            return;
        }

        var tables = source_or_destination === "source" ? this.workspace.importSourceDatasets() : this.workspace.sandboxTables({allImportDestinations: true});
        var datasetDialog = new chorus.dialogs.DatasetsPicker({ collection: tables, title: t("dataset.pick_" + source_or_destination) });

        this.listenTo(datasetDialog, "datasets:selected", function (datasets) {
            return this.datasetsChosen(datasets, source_or_destination);
        });

        this.launchSubModal(datasetDialog);
    },

    launchSourceDatasetPickerDialog: function (e) {
        this.launchDatasetPickerDialog(e, 'source');
    },

    launchDestinationDatasetPickerDialog: function (e) {
        this.launchDatasetPickerDialog(e, 'destination');
    }
});