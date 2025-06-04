/**
 * src/edit.js
 *
 * This is the editor view for “endoplanner/v2-wizard”.
 * Replace the inside of <div>…</div> with your actual wizard React components.
 */

import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import Wizard from './components/wizard';

export default function Edit() {
    const blockProps = useBlockProps();

    return (
        <div { ...blockProps }>
            <Wizard />
        </div>
    );
}
