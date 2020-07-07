import { SideNavController } from '../../../code/components/atoms/side-nav/useSideNavController';


export const mockUseSideNavController: jest.MockedFunction<() => Partial<SideNavController>> = jest.fn();

jest.mock('../../../code/components/atoms/side-nav/useSideNavController', () => ({
    useSideNavController: mockUseSideNavController,
}));
