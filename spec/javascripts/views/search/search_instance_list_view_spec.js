describe("chorus.views.SearchInstanceList", function() {
    beforeEach(function() {
        this.result = fixtures.searchResult();

        this.result.set({query: "foo"});
        this.models = this.result.instances();
        this.models.attributes.total = 24;
        this.view = new chorus.views.SearchInstanceList({ collection: this.models, query: this.result });
        this.view.render()
    });

    context("filtered search", function() {
        beforeEach(function() {
            this.result.set({entityType: "instance"});
            this.view.render();
        });

        describe("pagination bar", function() {
            context("when there are two pages of results", function() {
                context("and I am on the first page", function() {
                    beforeEach(function() {
                        spyOn(this.result, "hasPreviousPage").andReturn(false);
                        spyOn(this.result, "hasNextPage").andReturn(true);
                        this.view.render();
                    });

                    it("should have a next link", function() {
                        expect(this.view.$('.pagination a.next')).toExist();
                        expect(this.view.$('.pagination a.next')).toContainTranslation("search.next");
                    });

                    it("should not have a previous link", function() {
                        expect(this.view.$('.pagination a.previous')).not.toExist();
                    });

                    it("should have previous in plain text", function() {
                        expect(this.view.$('.pagination span.previous')).toContainTranslation("search.previous");
                    });

                });

                context("and I am on the second page", function(){
                    beforeEach(function() {
                        spyOn(this.result, "hasNextPage").andReturn(false);
                        spyOn(this.result, "hasPreviousPage").andReturn(true);
                        this.view.render();
                    });

                    it("should have a previous link", function() {
                        expect(this.view.$('.pagination a.previous')).toExist();
                        expect(this.view.$('.pagination a.previous')).toContainTranslation("search.previous");
                    });

                    it("should not have a next link", function() {
                        expect(this.view.$('.pagination a.next')).not.toExist();
                    });

                    it("should have next in plain text", function() {
                        expect(this.view.$('.pagination span.next')).toContainTranslation("search.next");
                    });
                });
            })

            context("when there is one page of results", function() {
                beforeEach(function() {
                    spyOn(this.result, "hasNextPage").andReturn(false);
                    spyOn(this.result, "hasPreviousPage").andReturn(false);
                    this.view.render();
                });

                it("should not have next and previous links", function() {
                    expect(this.view.$('.pagination a.next')).not.toExist();
                    expect(this.view.$('.pagination a.previous')).not.toExist();
                });

                it("should have next and previous in plain text", function() {
                    expect(this.view.$('.pagination span.next')).toContainTranslation("search.next");
                    expect(this.view.$('.pagination span.previous')).toContainTranslation("search.previous");
                });
            })

            it("has a count of total results", function() {
                expect(this.view.$('.pagination .count')).toContainTranslation("search.results", {count: 24})
            });
        });
    });

    context("unfiltered search", function() {
        describe("details bar", function() {
            it("has a title", function() {
                expect(this.view.$(".details .title")).toContainTranslation("instances.title");
            });

            it("has a long count", function() {
                expect(this.view.$(".details .count")).toContainTranslation("search.count", {shown: "2", total: "24"});
            });

            it("has a showAll link", function() {
                expect(this.view.$('.details a.show_all')).not.toBeEmpty();
                expect(this.view.$(".details a.show_all")).toContainTranslation("search.show_all")
            })

            context("clicking the show all link", function() {
                beforeEach(function() {
                    spyOn(chorus.router, "navigate");
                    this.view.$("a.show_all").click();
                });

                it("should navigate to the instance results page", function() {
                    expect(chorus.router.navigate).toHaveBeenCalledWith(this.result.showUrl(), true);
                });
            });

            context("has no additional results", function() {
                beforeEach(function() {
                    this.view = new chorus.views.SearchInstanceList({
                        collection: new chorus.collections.InstanceSet([fixtures.instance(), fixtures.instance()], { total: "2" })
                    });

                    this.view.render()
                });

                it("has a short count", function() {
                    expect(this.view.$(".details .count")).toContainTranslation("search.count_short", {shown: "2"});
                });

                it("has no showAll link", function() {
                    expect(this.view.$(".details a.show_all")).not.toExist();
                })
            })

            context("has no results at all", function() {
                beforeEach(function() {
                    this.view = new chorus.views.SearchWorkspaceList({
                        collection: new chorus.collections.InstanceSet([], {total: "0"})
                    });

                    this.view.render()
                });

                it("does not show the bar or the list", function() {
                    expect(this.view.$(".details")).not.toExist();
                    expect(this.view.$("ul")).not.toExist();
                });
            })
        })
    });

    describe("list elements", function() {
        it("there is one for each model in the collection", function() {
            expect(this.view.$('li').length).toBe(2);
        });

        it("has the right data-cid attribute", function() {
            expect(this.view.$("li").eq(0).data("cid")).toBe(this.models.at(0).cid);
            expect(this.view.$("li").eq(1).data("cid")).toBe(this.models.at(1).cid);
        });

        it("includes the correct instance icon", function() {
            expect($(this.view.$("li img.provider")[0]).attr("src")).toBe("/images/instances/hadoop_instance.png");
            expect($(this.view.$("li img.provider")[1]).attr("src")).toBe("/images/instances/greenplum_instance.png");
        });

        it("includes the correct state icon", function() {
            expect($(this.view.$("li img.state")[0]).attr("src")).toBe("/images/instances/green.png");
            expect($(this.view.$("li img.state")[1]).attr("src")).toBe("/images/instances/red.png");
        });

        it("includes the state text as a title", function() {
            expect($(this.view.$("li img.state")[0]).attr("title")).toBe("Online");
            expect($(this.view.$("li img.state")[1]).attr("title")).toBe("Fault");
        });

        it("shows matching name", function() {
            expect(this.view.$("li .name").eq(0).html()).toContain("<em>my</em>_hadoop");
            expect(this.view.$("li .name").eq(1).html()).toContain("<em>my</em>_instance");
        });
    });

    describe("comments", function() {
        beforeEach(function() {
            this.view.collection.models[0].set({
                comments: [
                    {
                        "lastUpdatedStamp": "2012-03-07 17:19:14",
                        "isPublished": false,
                        "content": "what an awesome instance",
                        "isComment": false,
                        "id": "10120",
                        "isInsight": true,
                        "highlightedAttributes": {
                            "content": ["what an <em>awesome<\/em> instance"]
                        },
                        "owner": {
                            "id": "InitialUser",
                            "lastName": "Admin",
                            "firstName": "EDC"
                        }
                    }
                ]
            });
            this.view.render();
        });

        it("renders the comments", function() {
            expect(this.view.$("li:eq(0) .search_result_comment_list .comment").length).toBe(1);
        });
    })
});
