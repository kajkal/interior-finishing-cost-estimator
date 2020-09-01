import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { MockRouter } from '../../../__utils__/mocks/MockRouter';

import { ProjectsCollapsibleList } from '../../../../code/components/navigation/protected/ProjectsCollapsibleList';
import { nav } from '../../../../code/config/nav';


describe('ProjectsCollapsibleList component', () => {

    const mockHandleSideNavToggle = jest.fn();
    const projects = [
        { name: 'Sample project', slug: 'sample-project' },
        { name: 'Project sample', slug: 'project-sample' },
    ];

    beforeEach(() => {
        mockHandleSideNavToggle.mockReset();
    });

    it('should open SideNav and expand collapsible list on click when SideNav is initially closed', () => {
        const { rerender } = render(<ProjectsCollapsibleList
            isSideNavOpen={false}
            onSideNavToggle={mockHandleSideNavToggle}
            projects={projects}
        />, { wrapper: MockRouter });

        // simulate 'isSideNavOpen' prop change on 'onSideNavToggle' prop call
        mockHandleSideNavToggle.mockImplementation(() => {
            rerender(<ProjectsCollapsibleList
                isSideNavOpen={true}
                onSideNavToggle={mockHandleSideNavToggle}
                projects={projects}
            />);
        });

        const collapsibleListTrigger = screen.getByRole('button', { name: /^t:common.projects(Expand|Collapse)$/ });

        // verify collapsed list trigger
        expect(collapsibleListTrigger).toHaveTextContent('t:common.projects');
        expect(collapsibleListTrigger).toHaveAttribute('aria-label', 't:common.projectsExpand');

        // expand list and open SideNav
        userEvent.click(collapsibleListTrigger);

        // verify if sidenav was triggered and collapsible list is expanded
        expect(mockHandleSideNavToggle).toHaveBeenCalledTimes(1);
        expect(collapsibleListTrigger).toHaveAttribute('aria-label', 't:common.projectsCollapse');
    });

    it('should render tooltip with action description when SideNav is collapsed', () => {
        const { rerender } = render(<ProjectsCollapsibleList
            isSideNavOpen={false}
            onSideNavToggle={mockHandleSideNavToggle}
            projects={projects}
        />, { wrapper: MockRouter });

        const collapsibleListTrigger = screen.getByRole('button', { name: /^t:common.projects(Expand|Collapse)$/ });
        expect(collapsibleListTrigger).toHaveAttribute('title', 't:common.projectsExpand');

        rerender(<ProjectsCollapsibleList
            isSideNavOpen={true}
            onSideNavToggle={mockHandleSideNavToggle}
            projects={projects}
        />);
        expect(collapsibleListTrigger).toHaveAttribute('title', '');
    });

    it('should show user projects when project list is expanded and hide when is collapsed', async () => {
        render(<ProjectsCollapsibleList
            isSideNavOpen={true}
            onSideNavToggle={mockHandleSideNavToggle}
            projects={projects}
        />, { wrapper: MockRouter });

        const collapsibleListTrigger = screen.getByRole('button', { name: /^t:common.projects(Expand|Collapse)$/ });
        const linkToCreateNewProject = screen.getByRole('button', { name: 't:common.createProject' });
        const linkToProject1 = screen.getByRole('button', { name: 't:common.projectAriaLabel:{"name":"Sample project"}' });
        const linkToProject2 = screen.getByRole('button', { name: 't:common.projectAriaLabel:{"name":"Project sample"}' });

        // verify links
        expect(linkToCreateNewProject).toHaveAttribute('href', nav.createProject());
        expect(linkToProject1).toHaveAttribute('href', nav.project('sample-project'));
        expect(linkToProject2).toHaveAttribute('href', nav.project('project-sample'));

        // verify if list is initially closed
        expect(screen.queryByRole('button', { name: 't:common.projectsCollapse' })).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 't:common.projectsExpand' })).toBeNull();

        // verify if links are visible when list is expanded
        expect(collapsibleListTrigger).toHaveAttribute('aria-label', 't:common.projectsCollapse');
        expect(linkToCreateNewProject).toBeVisible();
        expect(linkToProject1).toBeVisible();
        expect(linkToProject2).toBeVisible();

        // toggle list
        userEvent.click(collapsibleListTrigger);

        // verify if links are invisible when list is collapsed
        expect(collapsibleListTrigger).toHaveAttribute('aria-label', 't:common.projectsExpand');
        await waitFor(() => expect(linkToCreateNewProject).not.toBeVisible());
        expect(linkToProject1).not.toBeVisible();
        expect(linkToProject2).not.toBeVisible();
    });

});
