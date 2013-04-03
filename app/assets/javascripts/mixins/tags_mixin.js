chorus.Mixins.Taggable = {

    hasTags: function() {
        return this.tags().length > 0;
    },

    tags: function() {
        if(!this.loaded) {
            return new chorus.collections.TaggingSet([], {entity: this});
        }

        if(!this._tags) {
            this._tags = new chorus.collections.TaggingSet(this.get('tags'), {entity: this});
        }
        return this._tags;
    },

    updateTags: function(options) {
        this.taggingsUpdater = this.taggingsUpdater || new chorus.models.TaggingsUpdater({
            collection: new chorus.collections.Base([this])
        });
        this.taggingsUpdater.updateTags(options);
    }
};