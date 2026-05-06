import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import './AvailabilityTable.css';

const getStatusClass = (status) => {
    if (!status) return '';
    if (status.includes('0 - Disponível')) return 'status-available';
    if (status.includes('1 - Vendido')) return 'status-sold';
    if (status.includes('2 - Reservado')) return 'status-reserved';
    if (status.includes('4 - Quitado')) return 'status-quitado';
    if (status.includes('7 - Suspenso') || status.includes('8 - Fora de venda')) return 'status-suspended';
    return '';
};

const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';

    let numericValue;
    if (typeof value === 'string') {
        numericValue = parseFloat(value.replace(/\./g, '').replace(',', '.'));
    } else {
        numericValue = value;
    }

    if (isNaN(numericValue)) return 'R$ 0,00';

    return numericValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

const SortableHeader = ({ label, mobileLabel, sortKey, onSort, sortConfig }) => {
    const isActive = sortConfig?.key === sortKey;
    const sortIcon = isActive
        ? sortConfig.direction === 'asc'
            ? <ArrowUp size={14} />
            : <ArrowDown size={14} />
        : null;

    return (
        <th onClick={() => onSort(sortKey)} className="sortable-header">
            <div className="header-content">
                <span className="hide-mobile">{label}</span>
                <span className="show-mobile">{mobileLabel}</span>
                {sortIcon}
            </div>
        </th>
    );
};

const AvailabilityTable = ({ data, loading, onRowClick, onSort, sortConfig }) => {
    if (loading) {
        return <div className="loading">Carregando dados...</div>;
    }

    if (!data || data.length === 0) {
        return <div className="no-results">Nenhum lote encontrado.</div>;
    }

    return (
        <div className="table-container">
            <table className="data-table">
                <thead>
                    <tr>
                        <SortableHeader label="Quadra" mobileLabel="QD" sortKey="QD" onSort={onSort} sortConfig={sortConfig} />
                        <SortableHeader label="Lote" mobileLabel="LT" sortKey="LT" onSort={onSort} sortConfig={sortConfig} />
                        <SortableHeader label="M²" mobileLabel="M²" sortKey="M2" onSort={onSort} sortConfig={sortConfig} />
                        <SortableHeader label="Valor" mobileLabel="R$" sortKey="Valor_Terreno" onSort={onSort} sortConfig={sortConfig} />
                        <th><span className="hide-mobile">Status</span><span className="show-mobile">ST.</span></th>
                        <th><span className="hide-mobile">Logradouro</span><span className="show-mobile">LOG.</span></th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr
                            key={`${item.QD}-${item.LT}-${index}`}
                            onClick={() => onRowClick(item)}
                            className="clickable-row"
                        >
                            <td>{item.QD}</td>
                            <td>{item.LT}</td>
                            <td>{item.M2}</td>
                            <td className="value-cell">{formatCurrency(item.Valor_Terreno)}</td>
                            <td>
                                <span className={`status-badge ${getStatusClass(item.Status_Terreno)}`}>
                                    {item.Status_Terreno.includes(' - ') ? item.Status_Terreno.split(' - ')[1] : item.Status_Terreno}
                                </span>
                            </td>
                            <td>{item.Logradouro}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AvailabilityTable;
