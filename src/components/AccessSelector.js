import { SelectControl } from '@wordpress/components';
import { useWizard } from './WizardContext';

export default function AccessSelector() {
  const { state, setState } = useWizard();
  const form = state.access;

  const handleChange = (field, value) =>
    setState(prev => ({
      ...prev,
      access: { ...prev.access, [field]: value }
    }));

  return (
    <SelectControl
      label="Gauge"
      options={["18 G", "19 G", "21 G"].map(v => ({ label: v, value: v }))}
      value={form.needle.gauge}
      onChange={v => handleChange('needle', { ...form.needle, gauge: v })}
    />
  );
}
