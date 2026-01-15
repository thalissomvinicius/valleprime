import React, { useState } from 'react';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
    const [quadraTerm, setQuadraTerm] = useState('');
    const [loteTerm, setLoteTerm] = useState('');

    const handleQuadraChange = (e) => {
        const value = e.target.value;
        setQuadraTerm(value);
        onSearch({ quadra: value, lote: loteTerm });
    };

    const handleLoteChange = (e) => {
        const value = e.target.value;
        setLoteTerm(value);
        onSearch({ quadra: quadraTerm, lote: value });
    };

    return (
        <div className="search-bar-container">
            <div className="input-group">
                <div className="input-wrapper">
                    <label className="input-label">Quadra</label>
                    <input
                        type="text"
                        placeholder="Quadra..."
                        value={quadraTerm}
                        onChange={handleQuadraChange}
                        className="search-input quadra-input"
                    />
                </div>
                <div className="input-wrapper">
                    <label className="input-label">Lote</label>
                    <input
                        type="text"
                        placeholder="Lote..."
                        value={loteTerm}
                        onChange={handleLoteChange}
                        className="search-input lote-input"
                    />
                </div>
            </div>


        </div>
    );
};

export default SearchBar;
