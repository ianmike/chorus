chorus.views.visualizations.Timeseries = chorus.views.Base.extend({
    render: function() {
        var $el = $(this.el);
        $el.addClass("visualization");
        var data = new chorus.presenters.visualizations.Timeseries(this.model).present();

        var svg = d3.select(this.el)
            .append("svg")
            .attr("class", "chart timeseries")
            .attr("width", 925)
            .attr("height", 340);

        this.axes = new chorus.views.visualizations.Axes({
            el: svg,
            yScaleType: "numeric",
            xScaleType: "time",
            maxYValue: data.maxY,
            minYValue: data.minY,
            minXValue: data.minX,
            maxXValue: data.maxX,
            xAxisLabel: this.model.get("xAxis"),
            yAxisLabel: this.model.get("yAxis"),
            hasYGrids: true,
            paddingX: 35,
            paddingY: 35
        });

        if (!$el.isOnDom()) return;

        this.axes.render();

        var scales = this.axes.scales();
        // var centerXScale = function(d) { return scales.x(d) + scales.x.rangeBand() / 2 };

        var line = d3.svg.line()
            .x(function(d) { return scales.x(Date.parse(d.time));  })
            .y(function(d) { return scales.y(d.value); });

        svg.append("svg:path")
            .attr("class", "series")
            .attr("d", line(data));
    }
});

