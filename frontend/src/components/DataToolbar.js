import React from 'react';

function DataToolbar({ searchTerm, onSearchChange, filterField, filterValue, onFilterChange, filterOptions, sortField, sortDir, onSort, columns, data, exportFilename }) {

  const handleExportCSV = () => {
    if (!data || data.length === 0) return;
    const headers = columns.map(c => c.label);
    const rows = data.map(row => columns.map(c => {
      const val = c.accessor ? c.accessor(row) : row[c.key];
      return typeof val === 'string' && val.includes(',') ? `"${val}"` : (val ?? '');
    }));
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exportFilename || 'export'}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="data-toolbar">
      <div className="toolbar-left">
        <div className="search-box">
          <span className="search-icon">&#128269;</span>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button className="search-clear" onClick={() => onSearchChange('')}>&times;</button>
          )}
        </div>
        {filterOptions && (
          <select
            className="toolbar-filter"
            value={filterValue}
            onChange={e => onFilterChange(e.target.value)}
          >
            <option value="">All {filterField}</option>
            {filterOptions.map(opt => (
              <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
            ))}
          </select>
        )}
      </div>
      <div className="toolbar-right">
        <span className="toolbar-count">{data.length} record{data.length !== 1 ? 's' : ''}</span>
        <button className="btn-export" onClick={handleExportCSV} disabled={data.length === 0}>
          Export CSV
        </button>
      </div>
    </div>
  );
}

export function SortableHeader({ label, field, sortField, sortDir, onSort }) {
  const active = sortField === field;
  return (
    <th className="sortable-th" onClick={() => onSort(field)}>
      {label}
      <span className={`sort-indicator ${active ? 'active' : ''}`}>
        {active ? (sortDir === 'asc' ? ' \u25B2' : ' \u25BC') : ' \u25B4'}
      </span>
    </th>
  );
}

export function SummaryCards({ items }) {
  return (
    <div className="summary-cards">
      {items.map((item, i) => (
        <div key={i} className="summary-card">
          <div className="summary-value">{item.value}</div>
          <div className="summary-label">{item.label}</div>
        </div>
      ))}
    </div>
  );
}

export function useDataTable(data, { searchFields = [], defaultSort = '', defaultDir = 'asc' } = {}) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterValue, setFilterValue] = React.useState('');
  const [sortField, setSortField] = React.useState(defaultSort);
  const [sortDir, setSortDir] = React.useState(defaultDir);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const filtered = React.useMemo(() => {
    let result = [...data];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(row =>
        searchFields.some(field => {
          const val = row[field];
          return val && String(val).toLowerCase().includes(term);
        })
      );
    }

    if (sortField) {
      result.sort((a, b) => {
        let va = a[sortField] ?? '';
        let vb = b[sortField] ?? '';
        if (typeof va === 'number' && typeof vb === 'number') {
          return sortDir === 'asc' ? va - vb : vb - va;
        }
        va = String(va).toLowerCase();
        vb = String(vb).toLowerCase();
        if (va < vb) return sortDir === 'asc' ? -1 : 1;
        if (va > vb) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, searchFields, sortField, sortDir]);

  return {
    searchTerm, setSearchTerm,
    filterValue, setFilterValue,
    sortField, sortDir, handleSort,
    filtered,
  };
}

export default DataToolbar;
