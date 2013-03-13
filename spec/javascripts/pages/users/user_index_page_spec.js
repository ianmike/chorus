describe("chorus.pages.UserIndexPage", function() {
    beforeEach(function() {
        chorus.user = new chorus.models.User({
            "firstName": "Daniel",
            "lastName": "Burkes",
            "fullName": "Daniel Francis Burkes"
        });
        this.page = new chorus.pages.UserIndexPage();
        this.page.render();
    });

    describe("#initialize", function() {
        it("defaults to first name sorting ascending", function() {
            expect(this.page.collection.order).toBe("firstName");
        });

        it("has a helpId", function() {
            expect(this.page.helpId).toBe("users");
        });
    });

    describe("before the users have loaded", function() {
        it("has the right header title", function() {
            expect(this.page.$(".content_header h1").text()).toBe("Users");
        });

        it("defaults to first name sorting", function() {
            expect(this.page.$("li[data-type=lastName] .check")).toHaveClass("hidden");
            expect(this.page.$("li[data-type=firstName] .check")).not.toHaveClass("hidden");
        });

        it("shows the loading element", function() {
            expect(this.page.$(".loading")).toExist();
        });

        it("has a header", function() {
            expect(this.page.$("h1")).toExist();
        });

        describe("when the authenticated user is an admin", function() {
            beforeEach(function() {
                setLoggedInUser({ admin: true});
                this.page = new chorus.pages.UserIndexPage();
                this.page.render();
            });

            it("displays an 'add user' button", function() {
                expect(this.page.$("a.button[href=#/users/new]")).toExist();
            });
        });

        describe("when the authenticated user is not an admin", function() {
            beforeEach(function() {
                chorus.user.set({ admin: false });
                this.page = new chorus.pages.UserIndexPage();
                this.page.render();
            });

            it("does not display an 'add user' button", function() {
                expect(this.page.$("a[href=#/users/new] button")).not.toExist();
            });
        });
    });

    describe("menus", function() {
        describe("sorting", function() {
            beforeEach(function() {
                this.page.collection.order = undefined;
                spyOn(this.page.collection, "fetch");
            });

            it("has options for sorting", function() {
                expect(this.page.$("ul[data-event=sort] li[data-type=firstName]")).toExist();
                expect(this.page.$("ul[data-event=sort] li[data-type=lastName]")).toExist();
            });

            it("can sort the list by first name ascending", function() {
                this.page.$("li[data-type=firstName] a").click();
                expect(this.page.collection.order).toBe("firstName");
                expect(this.page.collection.fetch).toHaveBeenCalled();
            });

            it("can sort the list by last name ascending", function() {
                this.page.$("li[data-type=lastName] a").click();
                expect(this.page.collection.order).toBe("lastName");
            });
        });
    });

    describe("setting the model on a page event", function() {
        beforeEach(function() {
            this.user = rspecFixtures.user({ firstName: "Super", lastName: "Man" });
        });

        it("sets the model to user on a user:selected event", function() {
            expect(this.page.model).toBeUndefined();
            chorus.PageEvents.broadcast("user:selected", this.user);
            expect(this.page.model).toBe(this.user);
        });
    });

    describe("multiple selection", function() {
        beforeEach(function() {
            this.users = rspecFixtures.userSet();
            this.users.sortAsc("firstName");
            this.server.completeFetchFor(this.users);
        });

        it("does not display the multiple selection menu until items have been selected", function() {
            expect(this.page.$(".multiple_selection")).toHaveClass("hidden");
        });

        context("when an item has been checked", function() {
            beforeEach(function() {
                this.selectedModels = new chorus.collections.Base(this.users.first(2));
                chorus.PageEvents.broadcast("user:checked", this.selectedModels);
            });

            it("displays the multiple selection section", function() {
                expect(this.page.$(".multiple_selection")).not.toHaveClass("hidden");
            });

            it("has an action to edit tags", function() {
                expect(this.page.$(".multiple_selection a.edit_tags")).toExist();
            });

            describe("clicking the 'edit_tags' link", function() {
                beforeEach(function() {
                    this.modalSpy = stubModals();
                    this.page.$(".multiple_selection a.edit_tags").click();
                });

                it("launches the dialog for editing tags", function() {
                    expect(this.modalSpy).toHaveModal(chorus.dialogs.EditTags);
                    expect(this.modalSpy.lastModal().collection).toBe(this.page.multiSelectSidebarMenu.selectedModels);
                });
            });
        });
    });
});
