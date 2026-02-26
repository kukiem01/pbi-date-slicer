"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import { RangeFilterComponent, RangeOption } from "./component";
import { VisualFormattingSettingsModel, VisualStyleSettings, defaultVisualStyleSettings } from "./settings";
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
    private formattingSettingsService: FormattingSettingsService;
    private formattingSettings: VisualFormattingSettingsModel;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.host = options.host;
        this.formattingSettingsService = new FormattingSettingsService();
        this.formattingSettings = new VisualFormattingSettingsModel();
    }

    public update(options: VisualUpdateOptions) {
        this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
            VisualFormattingSettingsModel,
            options.dataViews?.[0]
        );

        if (!options.dataViews?.[0]?.categorical) {
            this.clear();
            return;
        }

        const categorical = options.dataViews[0].categorical;
        const cats = categorical.categories ?? [];

        const textCategory = cats.find(c => c.source?.roles?.category);
        const indexCategory = cats.find(c => c.source?.roles?.sortIndex);

        if (!textCategory || !indexCategory) {
            this.clear();
            return;
        }

        const fullQueryName = indexCategory.source.queryName;
        const dotIdx = fullQueryName?.lastIndexOf(".") ?? -1;

        if (!fullQueryName || dotIdx < 1 || dotIdx === fullQueryName.length - 1) {
            this.clear();
            return;
        }

        const tableName = fullQueryName.substring(0, dotIdx);
        const columnName = fullQueryName.substring(dotIdx + 1);

        const filterTarget: models.IFilterColumnTarget = {
            table: tableName,
            column: columnName
        };

        const uniqueMap = new Map<number, RangeOption>();

        textCategory.values.forEach((categoryValue, i) => {
            const sortVal = Number(indexCategory.values[i]);
            if (Number.isNaN(sortVal)) {
                return;
            }

            if (!uniqueMap.has(sortVal)) {
                uniqueMap.set(sortVal, {
                    label: String(categoryValue),
                    index: sortVal
                });
            }
        });

        const rangeOptions = Array.from(uniqueMap.values()).sort((a, b) => a.index - b.index);

        if (rangeOptions.length === 0) {
            this.clear();
            return;
        }

        const styleSettings = this.getStyleSettings();
        const selectedIndexes = this.getSelectedIndexesFromFilter(options.jsonFilters, filterTarget);

        const reactElement = React.createElement(RangeFilterComponent, {
            options: rangeOptions,
            styleSettings,
            selectedIndexes,
            onSelectionChanged: (selectedIndexes: number[]) => {
                let filter: models.BasicFilter | null = null;

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

    public getFormattingModel(): powerbi.visuals.FormattingModel {
        return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
    }

    private getSelectedIndexesFromFilter(
        jsonFilters: powerbi.IFilter[] | undefined,
        target: models.IFilterColumnTarget
    ): number[] | null {
        if (!jsonFilters?.length) {
            return null;
        }

        for (const rawFilter of jsonFilters as models.IFilter[]) {
            const basicFilter = rawFilter as models.IBasicFilter;
            const filterTarget = basicFilter?.target as models.IFilterColumnTarget;
            const hasValues = Array.isArray(basicFilter?.values);
            const isMatchingTarget = filterTarget?.table === target.table && filterTarget?.column === target.column;

            if (basicFilter?.operator !== "In" || !hasValues || !isMatchingTarget) {
                continue;
            }

            const numericValues = basicFilter.values
                .map(value => Number(value))
                .filter(value => Number.isFinite(value));

            if (numericValues.length > 0) {
                return numericValues;
            }
        }

        return null;
    }

    private getStyleSettings(): VisualStyleSettings {
        const labels = this.formattingSettings.labelsCard;
        const controls = this.formattingSettings.controlsCard;
        const layout = this.formattingSettings.layoutCard;

        return {
            minLabelText: this.getTextValue(labels.minLabelText.value, defaultVisualStyleSettings.minLabelText),
            maxLabelText: this.getTextValue(labels.maxLabelText.value, defaultVisualStyleSettings.maxLabelText),
            labelFontFamily: this.getTextValue(labels.labelFontFamily.value, defaultVisualStyleSettings.labelFontFamily),
            labelFontSize: this.clampNumber(labels.labelFontSize.value, 8, 60, defaultVisualStyleSettings.labelFontSize),
            labelColor: this.getColorValue(labels.labelColor.value, defaultVisualStyleSettings.labelColor),
            valueFontFamily: this.getTextValue(controls.valueFontFamily.value, defaultVisualStyleSettings.valueFontFamily),
            valueFontSize: this.clampNumber(controls.valueFontSize.value, 8, 72, defaultVisualStyleSettings.valueFontSize),
            valueColor: this.getColorValue(controls.valueColor.value, defaultVisualStyleSettings.valueColor),
            controlBackgroundColor: this.getColorValue(controls.controlBackgroundColor.value, defaultVisualStyleSettings.controlBackgroundColor),
            controlBorderColor: this.getColorValue(controls.controlBorderColor.value, defaultVisualStyleSettings.controlBorderColor),
            accentColor: this.getColorValue(controls.accentColor.value, defaultVisualStyleSettings.accentColor),
            borderRadius: this.clampNumber(controls.borderRadius.value, 0, 24, defaultVisualStyleSettings.borderRadius),
            controlHeight: this.clampNumber(controls.controlHeight.value, 28, 80, defaultVisualStyleSettings.controlHeight),
            showIcon: layout.showIcon.value,
            containerBackgroundColor: this.getColorValue(layout.containerBackgroundColor.value, defaultVisualStyleSettings.containerBackgroundColor)
        };
    }

    private getTextValue(value: string, fallback: string): string {
        return value && value.trim().length > 0 ? value : fallback;
    }

    private getColorValue(value: powerbi.ThemeColorData, fallback: string): string {
        return value?.value ?? fallback;
    }

    private clampNumber(value: number, min: number, max: number, fallback: number): number {
        const safeValue = Number.isFinite(value) ? value : fallback;
        return Math.max(min, Math.min(max, safeValue));
    }

    private clear() {
        ReactDOM.unmountComponentAtNode(this.target);
    }
}
