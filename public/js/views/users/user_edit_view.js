;
(function($, ns) {
    ns.UserEdit = chorus.views.Base.extend({
        className: "user_edit",

        events : {
            "submit form" : 'saveEditUser',
            "click button.cancel" : "goBack"
        },

        subviews: {
            '.edit_photo': "imageUpload"
        },

        additionalContext: function() {
            return {
                permission : ((this.model.get("userName") == chorus.session.user().get("userName")) || chorus.session.user().get("admin"))
            }
        },

        setup : function() {
            this.model.bind("saved", userSuccessfullySaved, this);
            this.imageUpload = new ns.ImageUpload({ model : this.model, changeImageKey: "users.edit_photo" });
        },

        saveEditUser : function saveEditUser(e) {
            e.preventDefault();
            var updates = {};
            _.each(this.$("input"), function(i) {
                var input = $(i);
                updates[input.attr("name")] = input.val().trim();
            });

            updates.admin = this.$("input#admin-checkbox").prop("checked") || false;
            updates.notes = this.$("textarea").val().trim()

            this.model.save(updates);
        },

        goBack : function() {
            window.history.back();
        }
    });

    function userSuccessfullySaved() {
        chorus.router.navigate(this.model.showUrl(), true);
    }

})(jQuery, chorus.views);
