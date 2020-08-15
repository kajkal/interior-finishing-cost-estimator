import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import DoneAllIcon from '@material-ui/icons/DoneAll';
import Chip from '@material-ui/core/Chip';

import { areAllOptionsSelected, isOptionExclusivelySelected, isOptionSelected, SelectedOptions } from '../../../utils/filters/filtersUtils';
import { Option } from '../../../utils/hooks/useCurrentUserDataSelectors';


export interface FilterOptionsProps {
    options: Option[];
    selectedOptions: SelectedOptions;
    onChange: (value: SelectedOptions) => void;
    groupClassName?: string;
    groupAriaLabel?: string;
    selectAllOptionsChipLabel?: string;
    optionChipAriaLabel?: (optionName: string) => string;
}

export function FilterOptions(props: FilterOptionsProps): React.ReactElement {
    const {
        options,
        selectedOptions,
        onChange,
        groupClassName,
        groupAriaLabel,
        selectAllOptionsChipLabel,
        optionChipAriaLabel,
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
                options.map(({ name: optionName, occurrenceCount }) => (
                    <Chip
                        key={optionName}
                        label={(
                            <>
                                <Typography variant='inherit'>
                                    {optionName}
                                </Typography>
                                <Typography
                                    variant='inherit'
                                    color='textSecondary'
                                    className={classes.occurrenceCount}
                                >
                                    {`(${occurrenceCount})`}
                                </Typography>
                            </>
                        )}

                        color={isOptionSelected(selectedOptions, optionName) ? 'primary' : 'default'}
                        className={classes.optionChip}
                        variant='outlined'
                        size='small'
                        clickable

                        role='checkbox'
                        aria-checked={isOptionSelected(selectedOptions, optionName)}
                        aria-label={optionChipAriaLabel?.(optionName)}

                        onClick={() => onChange(toggleOption(options, selectedOptions, optionName))}
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
    occurrenceCount: {
        marginLeft: 4,
    },
});

