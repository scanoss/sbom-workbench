import { selectIsReadOnly } from '@store/workbench-store/workbenchSlice';
import { useSelector } from 'react-redux';

export default function useMode() {
  const isReadOnly = useSelector(selectIsReadOnly);

  return {
    isReadOnly,
    props: { disabled: isReadOnly },
    menu: { enabled: !isReadOnly }
  };
}
