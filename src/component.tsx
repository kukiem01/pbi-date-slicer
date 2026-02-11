import * as React from "react";
import { useState, useEffect } from "react";
import powerbi from "powerbi-visuals-api";

import ISelectionId = powerbi.visuals.ISelectionId;

export interface RangeOption {
    label: string;
    index: number;
    selectionId: ISelectionId;
}

export interface Props {
    options: RangeOption[];
    onSelectionChanged: (values: number[]) => void; // <-- indexy
}

export const RangeFilterComponent: React.FC<Props> = ({ options, onSelectionChanged }) => {
    const [fromIndex, setFromIndex] = useState<number>(0);
    const [toIndex, setToIndex] = useState<number>(0);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    useEffect(() => {
        if (options.length === 0) return;

        if (!isInitialized) {
            setFromIndex(options[0].index);
            setToIndex(options[options.length - 1].index);
            setIsInitialized(true);
            return;
        }

        const currentFromExists = options.some(o => o.index === fromIndex);
        const currentToExists = options.some(o => o.index === toIndex);

        if (!currentFromExists) setFromIndex(options[0].index);
        if (!currentToExists) setToIndex(options[options.length - 1].index);
    }, [options]);

    const triggerFilter = (start: number, end: number) => {
        const itemsToSelect = options.filter(o => o.index >= start && o.index <= end);
        const values = itemsToSelect.map(o => o.index); // <-- zwracamy indexy
        onSelectionChanged(values);
    };

    const handleFromChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newFrom = Number(e.target.value);
        setFromIndex(newFrom);

        if (newFrom > toIndex) {
            setToIndex(newFrom);
            triggerFilter(newFrom, newFrom);
        } else {
            triggerFilter(newFrom, toIndex);
        }
    };

    const handleToChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newTo = Number(e.target.value);
        setToIndex(newTo);
        triggerFilter(fromIndex, newTo);
    };

    const availableToOptions = options.filter(o => o.index >= fromIndex);

    return (
        <div className="range-filter-container">
            <div className="filter-group">
                <label>Min Period</label>

                <div className="select-control">
                    <span className="select-icon" aria-hidden="true" />
                    <select value={fromIndex} onChange={handleFromChange}>
                        {options.map((o) => (
                            <option key={o.index} value={o.index}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="filter-group">
                <label>Max Period</label>

                <div className="select-control">
                    <span className="select-icon" aria-hidden="true" />
                    <select value={toIndex} onChange={handleToChange}>
                        {availableToOptions.map((o) => (
                            <option key={o.index} value={o.index}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};
