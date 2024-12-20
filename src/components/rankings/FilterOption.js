export default function FilterOption({ text, active }) {
  return (
    <button className={`filterOption ${active ? '' : 'filterInactive'}`} style={{ backgroundColor: '#f00' }} onClick={(active) => (active = !active)}>
      {text}
    </button>
  )
}
