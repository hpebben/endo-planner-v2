/**
 * src/save.js
 *
 * For now, return `null` so the block does not render any static markup
 * on the front end.  You can change this later if you need to output
 * something on the front end.
 */

import { useBlockProps } from '@wordpress/block-editor';
import './frontend';

export default function save() {
    const blockProps = useBlockProps.save();
    return (
        <div { ...blockProps } />
    );
}
