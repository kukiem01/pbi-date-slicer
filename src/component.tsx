import * as React from "react";
import { useEffect, useState } from "react";

import { VisualStyleSettings } from "./settings";

export interface RangeOption {
    label: string;
    index: number;
}

export interface Props {
    options: RangeOption[];
    styleSettings: VisualStyleSettings;
    selectedIndexes: number[] | null;
    onSelectionChanged: (values: number[]) => void;
}

const HARD_CODED_LAYOUT = {
    controlWidthPx: 145,
    groupGapPx: 3,
    containerHorizontalPaddingPx: 0,
    containerVerticalPaddingPx: 0
} as const;

const CalendarIcon: React.FC = () => (
    <span className="select-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
    </span>
);

export const RangeFilterComponent: React.FC<Props> = ({
    options,
    styleSettings,
    selectedIndexes,
    onSelectionChanged
}) => {
    const [fromIndex, setFromIndex] = useState<number>(0);
    const [toIndex, setToIndex] = useState<number>(0);

    useEffect(() => {
        if (options.length === 0) {
            return;
        }

        const allIndexes = options.map(o => o.index);
        const validIndexSet = new Set(allIndexes);
        const validSelection = (selectedIndexes ?? []).filter(index => validIndexSet.has(index));
        const nextFrom = validSelection.length > 0 ? Math.min(...validSelection) : allIndexes[0];
        const nextTo = validSelection.length > 0 ? Math.max(...validSelection) : allIndexes[allIndexes.length - 1];

        if (fromIndex !== nextFrom) {
            setFromIndex(nextFrom);
        }

        if (toIndex !== nextTo) {
            setToIndex(nextTo);
        }
    }, [options, selectedIndexes, fromIndex, toIndex]);

    const triggerFilter = (start: number, end: number) => {
        const itemsToSelect = options.filter(o => o.index >= start && o.index <= end);
        const values = itemsToSelect.map(o => o.index);
        onSelectionChanged(values);
    };

    const handleFromChange = (newFrom: number) => {
        setFromIndex(newFrom);

        if (newFrom > toIndex) {
            setToIndex(newFrom);
            triggerFilter(newFrom, newFrom);
            return;
        }

        triggerFilter(newFrom, toIndex);
    };

    const handleToChange = (newTo: number) => {
        setToIndex(newTo);
        triggerFilter(fromIndex, newTo);
    };

    const availableToOptions = options.filter(o => o.index >= fromIndex);
    const descendingFromOptions = [...options].sort((a, b) => b.index - a.index);
    const descendingToOptions = [...availableToOptions].sort((a, b) => b.index - a.index);

    const rootStyle = {
        "--rf-label-font-family": styleSettings.labelFontFamily,
        "--rf-label-font-size": `${styleSettings.labelFontSize}px`,
        "--rf-label-color": styleSettings.labelColor,
        "--rf-value-font-family": styleSettings.valueFontFamily,
        "--rf-value-font-size": `${styleSettings.valueFontSize}px`,
        "--rf-value-color": styleSettings.valueColor,
        "--rf-control-bg": styleSettings.controlBackgroundColor,
        "--rf-control-border": styleSettings.controlBorderColor,
        "--rf-accent-color": styleSettings.accentColor,
        "--rf-border-radius": `${styleSettings.borderRadius}px`,
        "--rf-control-height": `${styleSettings.controlHeight}px`,
        // Hardcoded on purpose: native select popup geometry is unstable when layout width/gap/padding changes.
        "--rf-control-width": `${HARD_CODED_LAYOUT.controlWidthPx}px`,
        "--rf-group-gap": `${HARD_CODED_LAYOUT.groupGapPx}px`,
        "--rf-container-horizontal-padding": `${HARD_CODED_LAYOUT.containerHorizontalPaddingPx}px`,
        "--rf-container-vertical-padding": `${HARD_CODED_LAYOUT.containerVerticalPaddingPx}px`,
        "--rf-container-background": styleSettings.containerBackgroundColor
    } as React.CSSProperties;

    const minLabelText = styleSettings.minLabelText?.trim() || "Min Period";
    const maxLabelText = styleSettings.maxLabelText?.trim() || "Max Period";
    const fromSelectId = "range-filter-from";
    const toSelectId = "range-filter-to";

    return (
        <div className="range-filter-container" style={rootStyle}>
            <div className="filter-group">
                <label htmlFor={fromSelectId}>{minLabelText}</label>
                <div className="select-control">
                    {styleSettings.showIcon && <CalendarIcon />}

                    <select
                        id={fromSelectId}
                        className={styleSettings.showIcon ? "" : "no-icon"}
                        value={fromIndex}
                        onChange={(event) => handleFromChange(Number(event.target.value))}
                    >
                        {descendingFromOptions.map((option) => (
                            <option key={option.index} value={option.index}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="filter-group">
                <label htmlFor={toSelectId}>{maxLabelText}</label>
                <div className="select-control">
                    {styleSettings.showIcon && <CalendarIcon />}

                    <select
                        id={toSelectId}
                        className={styleSettings.showIcon ? "" : "no-icon"}
                        value={toIndex}
                        onChange={(event) => handleToChange(Number(event.target.value))}
                    >
                        {descendingToOptions.map((option) => (
                            <option key={option.index} value={option.index}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};
