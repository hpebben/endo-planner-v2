/**
 * src/edit.js
 *
 * This is the editor view for “endoplanner/v2-wizard”.
 * Replace the inside of <div>…</div> with your actual wizard React components.
 */

import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

export default function Edit() {
    const blockProps = useBlockProps();

    return (
        <div { ...blockProps } style={ { padding: '1rem', border: '1px solid #ccc' } }>
            <h2>{ __( 'EndoPlanner Wizard (Editor)', 'endoplanner' ) }</h2>
            <p>{ __( 'Replace this area with your multi-step React wizard.', 'endoplanner' ) }</p>
        </div>
    );
}
