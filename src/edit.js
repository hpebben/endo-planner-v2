/**
 * The editor‐side code for the block.  
 * In this example, we simply render your existing Step2 (patency map) component.
 */

import React from 'react';
import { useBlockProps } from '@wordpress/block-editor';
import Step2 from './components/steps/Step2_Patency';

export default function Edit( { attributes, setAttributes } ) {
    // `attributes.patencySegments` is where we keep our JSON object of segments.
    // `setAttributes` must receive an object containing the new attributes.
    // Here, we pass the entire attributes object (so Step2 can update it).
    return (
        <div { ...useBlockProps() }>
            <Step2
                data={ attributes }
                setData={ ( newData ) => setAttributes( newData ) }
            />
        </div>
    );
}
