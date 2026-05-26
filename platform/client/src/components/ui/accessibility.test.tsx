import React from 'react';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Button } from './Button';
import { Input } from './Input';
import { ModalShell } from './ModalShell';
import { DataTable } from './DataTable';

// Extend expect for jest-axe
expect.extend(toHaveNoViolations);

describe('Accessibility retrofitted primitives audits', () => {
    
    it('Button component has no accessibility violations', async () => {
        const { container } = render(
            <Button variant="primary" size="md">
                Launch Campaign
            </Button>
        );
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });

    it('Input component binds labels, helpers and error alerts accessibly', async () => {
        const { container } = render(
            <Input 
                id="email-test"
                label="Subscriber Email"
                required
                error="Please enter a valid email address."
                helperText="We will never share your email address."
            />
        );
        
        const results = await axe(container);
        expect(results).toHaveNoViolations();

        // Verify key accessibility bindings exist in DOM
        const inputElement = container.querySelector('input');
        expect(inputElement).toHaveAttribute('id', 'email-test');
        expect(inputElement).toHaveAttribute('required');
        expect(inputElement).toHaveAttribute('aria-required', 'true');
        expect(inputElement).toHaveAttribute('aria-invalid', 'true');
        
        const describedBy = inputElement?.getAttribute('aria-describedby');
        expect(describedBy).toContain('email-test-error');
        expect(describedBy).toContain('email-test-helper');
        
        const errorElement = container.querySelector('#email-test-error');
        expect(errorElement).toHaveAttribute('role', 'alert');
    });

    it('ModalShell component wraps and exposes dialog role accessibly', async () => {
        const { container } = render(
            <ModalShell 
                isOpen={true}
                onClose={() => {}}
                title="Review Campaign Details"
                description="Confirm sender metrics before dispatching."
            >
                <div>Modal Content Area</div>
            </ModalShell>
        );
        
        // Modal container should have proper dialog landmarks
        const dialogElement = container.querySelector('[role="dialog"]');
        expect(dialogElement).toHaveAttribute('aria-modal', 'true');
        expect(dialogElement).toHaveAttribute('aria-labelledby', 'modal-shell-title');
        expect(dialogElement).toHaveAttribute('aria-describedby', 'modal-shell-description');
    });

    it('DataTable component exhibits semantic grid hierarchy accessibly', async () => {
        const columns = [
            { key: 'email', header: 'Email Address', sortable: true },
            { key: 'name', header: 'Display Name' }
        ];
        const data = [
            { email: 'john@example.com', name: 'John Doe' },
            { email: 'jane@example.com', name: 'Jane Smith' }
        ];

        const { container } = render(
            <DataTable 
                columns={columns}
                data={data}
                emptyTitle="No contacts"
            />
        );

        const results = await axe(container);
        expect(results).toHaveNoViolations();

        // Verify scope attributes exist
        const headers = container.querySelectorAll('th');
        expect(headers[0]).toHaveAttribute('scope', 'col');
        
        // First body column cell should be a scope='row' th
        const rows = container.querySelectorAll('tbody tr');
        const firstCell = rows[0].querySelector('th');
        expect(firstCell).toHaveAttribute('scope', 'row');
    });
});
