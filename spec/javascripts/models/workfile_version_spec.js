describe("chorus.models.WorkfileVersion", function() {
    beforeEach(function() {
        this.model = new chorus.models.WorkfileVersion({workspaceId: 1, workfileId: 2, versionNum: 3});
    });
    describe("canEdit", function() {
        it("returns false when its version is not the current version", function() {
            this.model.set({latestVersionNum: "6", versionNum: "3"});
            expect(this.model.canEdit()).toBeFalsy();
        });

        it("returns true when its version is the current version", function() {
            this.model.set({latestVersionNum: "6", versionNum: "6"});
            expect(this.model.canEdit()).toBeTruthy();
        });
    });

    describe("initializing from a collection", function() {
        beforeEach(function() {
            this.collection = new chorus.models.WorkfileVersionSet([], {workspaceId: 1, workfileId: 2});
        });
        it("sets the workspaceId attribute on the model", function() {
            this.collection.add({versionNum: 5});

            expect(this.collection.models[0]).toBeA(chorus.models.WorkfileVersion);
            expect(this.collection.models[0].get("workspaceId")).toBe(this.collection.attributes.workspaceId);
        });
    });
});