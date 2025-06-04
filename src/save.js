/**
 * The front-end “save” for the block.  
 * In this minimal example, we don’t output any HTML/markup on the front end—
 * we keep it empty because all the patency‐map is purely in the editor. 
 * (If you do want to serialize something to the front end, you’d return real HTML here.)
 */

import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
    return <div { ...useBlockProps.save() } />;
}
