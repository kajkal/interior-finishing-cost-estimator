import { useTheme } from '@material-ui/core/styles';
import { useMediaQuery } from '@material-ui/core';


/**
 * Returns true when on mobile device. false otherwise.
 */
export function useMobileDetect(): boolean {
    const theme = useTheme();
    return useMediaQuery(theme.breakpoints.down('xs'));
}
