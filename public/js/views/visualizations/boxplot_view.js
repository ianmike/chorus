chorus.views.visualizations.Boxplot = chorus.views.Base.extend({
    render: function() {
        var $el = $(this.el);
        $el.addClass("visualization");
        var data = new chorus.presenters.visualizations.Boxplot(this.model).present();
        chorus.chart.boxplot(
            this.chartArea(this.el),
            data,
            {xAxisTitle: this.model.get("chart[xAxis]"),
             yAxisTitle: this.model.get("chart[yAxis]")}
        );
        this.postRender();
    },

    chartArea : function(el) {
        this.plotWidth = 925;
        this.plotHeight = 340;

        return d3.select(el)
            .append("svg:svg")
            .attr("class", "chart")
            .attr("width", this.plotWidth)
            .attr("height", this.plotHeight)
            .append("svg:g")
            .attr("class", "plot")
            .attr("width", this.plotWidth)
            .attr("height", this.plotHeight);
    }
});

