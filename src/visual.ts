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
        if (!options.dataViews?.[0]?.categorical) {
            this.clear();
            return;
        }

        const categorical = options.dataViews[0].categorical;
        const cats = categorical.categories ?? [];

        // category = Period Text, sortIndex = Sorting Index (obie jako categories po zmianie dataViewMappings)
        const textCategory = cats.find(c => c.source?.roles?.category);
        const indexCategory = cats.find(c => c.source?.roles?.sortIndex);

        if (!textCategory || !indexCategory) {
            this.clear();
            return;
        }

        // Filtr ma iść po kolumnie sortIndex
        const fullQueryName = indexCategory.source.queryName;
        const dotIdx = fullQueryName.indexOf(".");
        const tableName = dotIdx > -1 ? fullQueryName.substring(0, dotIdx) : fullQueryName;
        const columnName = indexCategory.source.displayName;

        const filterTarget: models.IFilterColumnTarget = {
            table: tableName,
            column: columnName
        };

        // Unikalne po sortIndex
        const uniqueMap = new Map<number, RangeOption>();

        textCategory.values.forEach((categoryValue, i) => {
            const sortVal = Number(indexCategory.values[i]);
            if (Number.isNaN(sortVal)) return;

            if (!uniqueMap.has(sortVal)) {
                // SelectionId budujemy na sortIndex -> cross-filter po indexach
                const selectionId = this.host.createSelectionIdBuilder()
                    .withCategory(indexCategory, i)
                    .createSelectionId();

                uniqueMap.set(sortVal, {
                    label: String(categoryValue),
                    index: sortVal,
                    selectionId
                });
            }
        });

        let rangeOptions = Array.from(uniqueMap.values());
        rangeOptions.sort((a, b) => a.index - b.index);

        const reactElement = React.createElement(RangeFilterComponent, {
            options: rangeOptions,
            onSelectionChanged: (selectedIndexes: number[]) => {
                let filter: models.BasicFilter = null;

                if (selectedIndexes?.length > 0) {
                    filter = new models.BasicFilter(
                        filterTarget,
                        "In",
                        selectedIndexes
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
