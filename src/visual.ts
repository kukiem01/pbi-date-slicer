"use strict";

import powerbi from "powerbi-visuals-api";
import { RangeFilterComponent, RangeOption } from "./component";
import * as React from "react";
import * as ReactDOM from "react-dom";
import * as models from "powerbi-models"; 

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;

import "./../style/visual.less";

export class Visual implements IVisual {
    private target: HTMLElement;
    private host: powerbi.extensibility.visual.IVisualHost;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.host = options.host;
    }

    public update(options: VisualUpdateOptions) {
        if (!options.dataViews || !options.dataViews[0] || !options.dataViews[0].categorical) {
            this.clear();
            return;
        }

        const categorical = options.dataViews[0].categorical;
        const categories = categorical.categories[0];
        const values = categorical.values ? categorical.values[0] : null;

        if (!categories || !values) {
            this.clear();
            return;
        }

        const fullQueryName = categories.source.queryName; 
        const tableName = fullQueryName.substr(0, fullQueryName.indexOf('.'));
        const columnName = categories.source.displayName;

        const filterTarget: models.IFilterColumnTarget = {
            table: tableName,
            column: columnName
        };

        const uniqueMap = new Map<number, RangeOption>();

        categories.values.forEach((categoryValue, i) => {
            const sortVal = Number(values.values[i]); 
            
            if (!uniqueMap.has(sortVal)) {
                const selectionId = this.host.createSelectionIdBuilder()
                    .withCategory(categories, i)
                    .createSelectionId();

                uniqueMap.set(sortVal, {
                    label: categoryValue.toString(),
                    index: sortVal,
                    selectionId: selectionId
                });
            }
        });

        let rangeOptions = Array.from(uniqueMap.values());

        rangeOptions.sort((a, b) => a.index - b.index);

        const reactElement = React.createElement(RangeFilterComponent, {
            options: rangeOptions,
            onSelectionChanged: (selectedValues: string[]) => {
                let filter: models.BasicFilter = null;

                if (selectedValues.length > 0) {
                    filter = new models.BasicFilter(
                        filterTarget,
                        "In",
                        selectedValues
                    );
                }

                this.host.applyJsonFilter(
                    filter, 
                    "general", 
                    "filter", 
                    powerbi.FilterAction.merge
                );
            }
        });

        ReactDOM.render(reactElement, this.target);
    }

    private clear() {
        ReactDOM.unmountComponentAtNode(this.target);
    }
}