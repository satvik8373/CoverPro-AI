const ToolCompare = ({ table }) => {
  if (!table) return null;

  return (
    <div className="glass p-4 overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="text-left py-2">Feature</th>
            {table.rows.map((row) => (
              <th key={row.tool} className="text-left py-2">{row.tool}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.feature.map((feature, idx) => (
            <tr key={feature} className="border-t border-white/20">
              <td className="py-2">{feature}</td>
              {table.rows.map((row) => (
                <td key={`${row.tool}-${feature}`} className="py-2">{row.values[idx]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ToolCompare;
