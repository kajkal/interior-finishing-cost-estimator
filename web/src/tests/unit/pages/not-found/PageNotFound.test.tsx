import React from 'react';
import { render, screen } from '@testing-library/react';

import { PageNotFound } from '../../../../code/components/pages/not-found/PageNotFound';


describe('PageNotFound component', () => {

    it('should display 404 error message', () => {
        render(<PageNotFound />);
        expect(screen.getByText('404')).toBeInTheDocument();
        expect(screen.getByText('t:notFoundPage.pageNotFound')).toBeInTheDocument();
    });

});
