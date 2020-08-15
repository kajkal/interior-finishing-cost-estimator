import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import Chip from '@material-ui/core/Chip';

import { areAllOptionsSelected, isOptionExclusivelySelected, isOptionSelected, SelectedOptions } from '../../../utils/filters/filtersUtils';
import { Option } from '../../../utils/hooks/useCurrentUserDataSelectors';


export interface OptionBase {
    name: string;
}

export interface FilterOptionsProps<OptionType extends OptionBase> {
    options: OptionType[];
    selectedOptions: SelectedOptions;
    onChange: (value: SelectedOptions) => void;
    groupClassName?: string;
    groupAriaLabel?: string;
    selectAllOptionsChipLabel?: string;
    optionChipAriaLabel?: (option: OptionType) => string;
    renderOptionChipLabel: (option: OptionType) => React.ReactNode
}

export function FilterOptions<OptionType extends OptionBase>(props: FilterOptionsProps<OptionType>): React.ReactElement {
    const {
        options,
        selectedOptions,
        onChange,
        groupClassName,
        groupAriaLabel,
        selectAllOptionsChipLabel,
        optionChipAriaLabel,
        renderOptionChipLabel,
    } = props;
    const classes = useStyles();

    return (
        <div className={groupClassName} role='group' aria-label={groupAriaLabel}>
            <Chip
                label={selectAllOptionsChipLabel}

                icon={<DoneAllIcon />}
                color={areAllOptionsSelected(selectedOptions) ? 'primary' : 'default'}
                className={classes.optionChip}
                variant='outlined'
                size='small'
                clickable

                role='checkbox'
                aria-checked={areAllOptionsSelected(selectedOptions)}

                onClick={() => onChange(areAllOptionsSelected(selectedOptions) ? new Set() : 'ALL')}
            />
            {
                options.map((option) => (
                    <Chip
                        key={option.name}
                        label={renderOptionChipLabel(option)}

                        color={isOptionSelected(selectedOptions, option.name) ? 'primary' : 'default'}
                        className={classes.optionChip}
                        variant='outlined'
                        size='small'
                        clickable

                        role='checkbox'
                        aria-checked={isOptionSelected(selectedOptions, option.name)}
                        aria-label={optionChipAriaLabel?.(option)}

                        onClick={() => onChange(toggleOption(options, selectedOptions, option.name))}
                    />
                ))
            }
        </div>
    );
}

function toggleOption(options: Option[], selectedOptions: SelectedOptions, optionName: string): SelectedOptions {
    // 'ALL' - option
    if (areAllOptionsSelected(selectedOptions)) {
        const newSelectedOptions = new Set(options.map(({ name }) => name));
        newSelectedOptions.delete(optionName);
        return newSelectedOptions;
    }
    // [...options] - option
    if (isOptionExclusivelySelected(selectedOptions, optionName)) {
        const newSelectedOptions = new Set(selectedOptions);
        newSelectedOptions.delete(optionName);
        return newSelectedOptions;
    }
    // [...allButOneOption] + option
    if (selectedOptions.size === options.length - 1) {
        return 'ALL';
    }
    // [...options] + option
    const newSelectedOptions = new Set(selectedOptions);
    newSelectedOptions.add(optionName);
    return newSelectedOptions;
}

const useStyles = makeStyles({
    optionChip: {
        marginTop: 3,
        marginRight: 3,
    },
});

