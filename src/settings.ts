"use strict";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";

import FormattingSettingsCard = formattingSettings.SimpleCard;
import FormattingSettingsSlice = formattingSettings.Slice;
import FormattingSettingsModel = formattingSettings.Model;

export interface VisualStyleSettings {
    minLabelText: string;
    maxLabelText: string;
    labelFontFamily: string;
    labelFontSize: number;
    labelColor: string;
    valueFontFamily: string;
    valueFontSize: number;
    valueColor: string;
    controlBackgroundColor: string;
    controlBorderColor: string;
    accentColor: string;
    borderRadius: number;
    controlHeight: number;
    showIcon: boolean;
    controlWidth: number;
    groupGap: number;
    containerHorizontalPadding: number;
    containerVerticalPadding: number;
    containerBackgroundColor: string;
}

export const defaultVisualStyleSettings: VisualStyleSettings = {
    minLabelText: "Min Period",
    maxLabelText: "Max Period",
    labelFontFamily: "Segoe UI",
    labelFontSize: 14,
    labelColor: "#111111",
    valueFontFamily: "Segoe UI",
    valueFontSize: 16,
    valueColor: "#2e7d32",
    controlBackgroundColor: "#ffffff",
    controlBorderColor: "#d8d8d8",
    accentColor: "#2e7d32",
    borderRadius: 6,
    controlHeight: 44,
    showIcon: true,
    controlWidth: 220,
    groupGap: 16,
    containerHorizontalPadding: 0,
    containerVerticalPadding: 0,
    containerBackgroundColor: "transparent"
};

class LabelsCardSettings extends FormattingSettingsCard {
    minLabelText = new formattingSettings.TextInput({
        name: "minLabelText",
        displayName: "Min label text",
        placeholder: "Min Period",
        value: defaultVisualStyleSettings.minLabelText
    });

    maxLabelText = new formattingSettings.TextInput({
        name: "maxLabelText",
        displayName: "Max label text",
        placeholder: "Max Period",
        value: defaultVisualStyleSettings.maxLabelText
    });

    labelFontFamily = new formattingSettings.FontPicker({
        name: "labelFontFamily",
        displayName: "Label font family",
        value: defaultVisualStyleSettings.labelFontFamily
    });

    labelFontSize = new formattingSettings.NumUpDown({
        name: "labelFontSize",
        displayName: "Label font size",
        value: defaultVisualStyleSettings.labelFontSize
    });

    labelColor = new formattingSettings.ColorPicker({
        name: "labelColor",
        displayName: "Label color",
        value: { value: defaultVisualStyleSettings.labelColor }
    });

    name: string = "labels";
    displayName: string = "Labels";
    slices: Array<FormattingSettingsSlice> = [
        this.minLabelText,
        this.maxLabelText,
        this.labelFontFamily,
        this.labelFontSize,
        this.labelColor
    ];
}

class ControlsCardSettings extends FormattingSettingsCard {
    valueFontFamily = new formattingSettings.FontPicker({
        name: "valueFontFamily",
        displayName: "Value font family",
        value: defaultVisualStyleSettings.valueFontFamily
    });

    valueFontSize = new formattingSettings.NumUpDown({
        name: "valueFontSize",
        displayName: "Value font size",
        value: defaultVisualStyleSettings.valueFontSize
    });

    valueColor = new formattingSettings.ColorPicker({
        name: "valueColor",
        displayName: "Value color",
        value: { value: defaultVisualStyleSettings.valueColor }
    });

    controlBackgroundColor = new formattingSettings.ColorPicker({
        name: "controlBackgroundColor",
        displayName: "Control background",
        value: { value: defaultVisualStyleSettings.controlBackgroundColor }
    });

    controlBorderColor = new formattingSettings.ColorPicker({
        name: "controlBorderColor",
        displayName: "Control border",
        value: { value: defaultVisualStyleSettings.controlBorderColor }
    });

    accentColor = new formattingSettings.ColorPicker({
        name: "accentColor",
        displayName: "Accent color",
        value: { value: defaultVisualStyleSettings.accentColor }
    });

    borderRadius = new formattingSettings.NumUpDown({
        name: "borderRadius",
        displayName: "Border radius",
        value: defaultVisualStyleSettings.borderRadius
    });

    controlHeight = new formattingSettings.NumUpDown({
        name: "controlHeight",
        displayName: "Control height",
        value: defaultVisualStyleSettings.controlHeight
    });

    name: string = "controls";
    displayName: string = "Controls";
    slices: Array<FormattingSettingsSlice> = [
        this.valueFontFamily,
        this.valueFontSize,
        this.valueColor,
        this.controlBackgroundColor,
        this.controlBorderColor,
        this.accentColor,
        this.borderRadius,
        this.controlHeight
    ];
}

class LayoutCardSettings extends FormattingSettingsCard {
    showIcon = new formattingSettings.ToggleSwitch({
        name: "showIcon",
        displayName: "Show calendar icon",
        value: defaultVisualStyleSettings.showIcon
    });

    controlWidth = new formattingSettings.NumUpDown({
        name: "controlWidth",
        displayName: "Dropdown width",
        value: defaultVisualStyleSettings.controlWidth
    });

    groupGap = new formattingSettings.NumUpDown({
        name: "groupGap",
        displayName: "Gap between dropdowns",
        value: defaultVisualStyleSettings.groupGap
    });

    containerHorizontalPadding = new formattingSettings.NumUpDown({
        name: "containerHorizontalPadding",
        displayName: "Horizontal padding",
        value: defaultVisualStyleSettings.containerHorizontalPadding
    });

    containerVerticalPadding = new formattingSettings.NumUpDown({
        name: "containerVerticalPadding",
        displayName: "Vertical padding",
        value: defaultVisualStyleSettings.containerVerticalPadding
    });

    containerBackgroundColor = new formattingSettings.ColorPicker({
        name: "containerBackgroundColor",
        displayName: "Container background",
        value: { value: defaultVisualStyleSettings.containerBackgroundColor }
    });

    name: string = "layout";
    displayName: string = "Layout";
    slices: Array<FormattingSettingsSlice> = [
        this.showIcon,
        this.controlWidth,
        this.groupGap,
        this.containerHorizontalPadding,
        this.containerVerticalPadding,
        this.containerBackgroundColor
    ];
}

export class VisualFormattingSettingsModel extends FormattingSettingsModel {
    labelsCard = new LabelsCardSettings();
    controlsCard = new ControlsCardSettings();
    layoutCard = new LayoutCardSettings();

    cards = [this.labelsCard, this.controlsCard, this.layoutCard];
}
