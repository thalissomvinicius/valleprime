import React, { useState } from 'react';
import { X, Send, Calculator, FileText, ClipboardCopy, CheckCircle } from 'lucide-react';
import './BudgetModal.css';

const BudgetModal = ({ lot, onClose, obraName, developerName = "Vinicius Dev" }) => {
    const lotValue = parseFloat(lot.Valor_Terreno.replace(/\./g, '').replace(',', '.')) || 0;

    const [downPaymentPercent, setDownPaymentPercent] = useState(5);
    const [downPaymentInstallments, setDownPaymentInstallments] = useState(1);
    const [balanceInstallments, setBalanceInstallments] = useState(200);
    const [copied, setCopied] = useState(false);

    const [discountActive, setDiscountActive] = useState(false);
    const [discountPercent, setDiscountPercent] = useState(20);

    const downPaymentTotal = lotValue * (downPaymentPercent / 100);
    const downPaymentInstallmentValue = downPaymentTotal / downPaymentInstallments;
    const remainingBalance = lotValue - downPaymentTotal;
    const balanceInstallmentValue = remainingBalance / balanceInstallments;

    // Calculate discounted value
    // Logic: Remove signal -> Apply 10% discount sequentially -> Add signal back
    const getDiscountedValues = () => {
        const balance = lotValue - downPaymentTotal;
        const steps = discountPercent / 10;
        let discountedBalance = balance;

        for (let i = 0; i < steps; i++) {
            discountedBalance = discountedBalance * 0.90;
        }

        const openBalance = discountedBalance;
        const totalWithDiscount = openBalance + downPaymentTotal;

        return {
            openBalance,
            totalWithDiscount
        };
    };

    const { openBalance, totalWithDiscount } = getDiscountedValues();

    // If discount is active, use the discounted total for remaining calculations (if it was a cash sale, but user said "not necessarily cash")
    // Use original balance for standard installments unless discount implies cash? 
    // User said "sometimes promotion... varies 10 to 30%... account always same style".
    // Usually big discounts are for cash or short term, but I will just display the final value.
    // If the user wants to simulate installments on the discounted value, I should use 'openBalance' instead of 'remainingBalance' for the installment calc?
    // "Saldo a Parcelar" logic:
    // User requested "Saldo a Parcelar" uses 'remainingBalance' (original). 
    // If discount is active, usually it's "À Vista" or "Special Condition".
    // I will assume for now this discount affects the Final Price.
    // Let's assume the installments area might use the discounted balance if active?
    // "Simulação do Saldo" usually is on the remaining balance.
    // I'll update remainingBalance based on discount state for the installment calc.

    // Safe calculation for installments (handle empty/0)
    const safeInstallments = parseInt(balanceInstallments) || 0;
    const effectiveRemainingBalance = discountActive ? openBalance : remainingBalance;
    const effectiveBalanceInstallmentValue = safeInstallments > 0 ? effectiveRemainingBalance / safeInstallments : 0;


    const formatCurrency = (val) => {
        if (!val || !Number.isFinite(val)) return 'R$ 0,00';
        return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const getPlanType = (n) => {
        if (n === 1) return 'À Vista';
        if (n <= 36) return 'Fixas';
        return 'Reajustáveis';
    };

    const getMessage = () => {
        const subdivision = obraName || lot.Descricao_Empreendimento || 'VALLE';

        // Formatar medidas: remove se for 0.00 ou - / -
        const checkMeasure = (val) => val && val.toString() !== '0,00' && val.toString() !== '0.00' && val.toString() !== '- / -';

        const measures = [
            checkMeasure(lot.M_Frente) && `Frente: ${lot.M_Frente}m`,
            checkMeasure(lot.M_Fundo) && `Fundo: ${lot.M_Fundo}m`,
            checkMeasure(lot.M_Lado_Direito) && `L.Dir: ${lot.M_Lado_Direito}m`,
            checkMeasure(lot.M_Lado_Esquerdo) && `L.Esq: ${lot.M_Lado_Esquerdo}m`,
            checkMeasure(lot.Chanfro) && `Chanfro: ${lot.Chanfro}m`
        ].filter(Boolean).join(' | ');

        let priceSection = `💰 *Valor do Lote: ${formatCurrency(lotValue)}*`;

        if (discountActive) {
            priceSection = `💰 *Valor do Lote:* ~${formatCurrency(lotValue)}~
🔥 *Oferta Especial (${discountPercent}% OFF):* ${formatCurrency(totalWithDiscount)}`;
        }

        return `
🚀 *PROPOSTA VALLE*
📍 *${subdivision}*
🔹 QD: ${lot.QD} | LT: ${lot.LT} (${lot.M2} m²)
📏 ${measures || 'Padrão'}
${discountActive ? `💵 *De:* ~${formatCurrency(lotValue)}~ *Por:* *${formatCurrency(totalWithDiscount)}*` : `💵 *Valor: ${formatCurrency(lotValue)}*`}

*Condições:*
📝 *Sinal:* ${formatCurrency(downPaymentTotal)} (${downPaymentInstallments > 1 ? downPaymentInstallments + 'x de ' + formatCurrency(downPaymentInstallmentValue) : '1x'})
📅 *Saldo:* ${balanceInstallments}x de *${formatCurrency(effectiveBalanceInstallmentValue)}* (${getPlanType(balanceInstallments)})

📑 *Docs:* RG, CPF, Comp. Residência, Cert. de Nascimento ou Casamento.
✅ Sem consulta SPC/Serasa. Financiamento Próprio.
⚠️ _Sujeito a alterações._
    `.trim();
    };

    const handleWhatsAppShare = () => {
        const encodedMessage = encodeURIComponent(getMessage());
        window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    };

    const handleCopyMessage = () => {
        const text = getMessage();

        // Check if navigator.clipboard is available (requires secure context)
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(err => {
                console.error('Falha ao copiar usando navigator.clipboard:', err);
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    };

    const fallbackCopy = (text) => {
        try {
            const textArea = document.createElement("textarea");
            textArea.value = text;

            // Ensure the textarea is not visible but part of the DOM
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            document.body.appendChild(textArea);

            textArea.focus();
            textArea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }
        } catch (err) {
            console.error('Erro no fallback de cópia:', err);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content animate-pop-in" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <div className="modal-title-wrapper">
                        <Calculator className="header-icon" />
                        <div>
                            <h2>Orçamento do Lote</h2>
                            <p>QD: {lot.QD} | LT: {lot.LT} - {lot.M2} m²</p>
                        </div>
                    </div>
                    <button className="close-btn" onClick={onClose}><X size={24} /></button>
                </header>

                <div className="modal-body">
                    <section className="modal-section main-value">
                        <div className="value-header-row">
                            <label>Valor Total do Lote</label>
                            <div className="discount-toggle">
                                <span className="discount-label">Desconto Especial?</span>
                                <label className="switch">
                                    <input type="checkbox" checked={discountActive} onChange={() => setDiscountActive(!discountActive)} />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>

                        {discountActive ? (
                            <div className="price-container">
                                <div className="old-price">{formatCurrency(lotValue)}</div>
                                <div className="new-price">{formatCurrency(totalWithDiscount)}</div>
                                <div className="discount-selector">
                                    {[10, 20, 30].map(pct => (
                                        <button
                                            key={pct}
                                            className={`discount-btn ${discountPercent === pct ? 'active' : ''}`}
                                            onClick={() => setDiscountPercent(pct)}
                                        >
                                            {pct}% OFF
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="value-display">{formatCurrency(lotValue)}</div>
                        )}

                        <div className="measurements-compact">
                            {[
                                { label: 'Frente', val: lot.M_Frente },
                                { label: 'Fundo', val: lot.M_Fundo },
                                { label: 'L. Dir', val: lot.M_Lado_Direito },
                                { label: 'L. Esq', val: lot.M_Lado_Esquerdo },
                                { label: 'Chanfro', val: lot.Chanfro }
                            ].filter(m => m.val && m.val !== '0,00' && m.val !== '0.00' && m.val !== '- / -').map((m, idx) => (
                                <div key={idx} className="measure-item">
                                    <span>{m.label}</span>
                                    <strong>{m.val}m</strong>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="calc-grid">
                        <section className="modal-section">
                            <label>Sinal (Entrada 5%)</label>
                            <div className="value-highlight">{formatCurrency(downPaymentTotal)}</div>
                            <div className="input-group-row">
                                <div className="input-field">
                                    <span>Parcelas do Sinal</span>
                                    <div className="installment-selector">
                                        {[1, 2, 3, 4, 5, 6].map(n => (
                                            <button
                                                key={n}
                                                className={`installment-btn ${downPaymentInstallments === n ? 'active' : ''}`}
                                                onClick={() => setDownPaymentInstallments(n)}
                                            >
                                                {n}x
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="installment-result">
                                    {downPaymentInstallments > 1 && (
                                        <p>{downPaymentInstallments}x de <strong>{formatCurrency(downPaymentInstallmentValue)}</strong></p>
                                    )}
                                </div>
                            </div>
                        </section>

                        <section className="modal-section balance-calc">
                            <label>Saldo a Parcelar</label>
                            <div className="value-highlight secondary">{formatCurrency(effectiveRemainingBalance)}</div>

                            <div className="input-group-row">
                                <div className="input-field">
                                    <span>Nº de Parcelas (1 a 200)</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="200"
                                        value={balanceInstallments}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (!isNaN(val)) setBalanceInstallments(Math.min(200, Math.max(1, val)));
                                            else setBalanceInstallments('');
                                        }}
                                    />
                                </div>
                                <div className="installment-result">
                                    <p>
                                        {balanceInstallments}x de <strong>{formatCurrency(effectiveBalanceInstallmentValue)}</strong>
                                        <br />
                                        <small className="plan-badge">{getPlanType(balanceInstallments)}</small>
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>


                </div>

                <footer className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Voltar</button>
                    <div className="footer-actions">
                        <button className={`btn-copy ${copied ? 'copied' : ''}`} onClick={handleCopyMessage}>
                            {copied ? <CheckCircle size={18} /> : <ClipboardCopy size={18} />}
                            {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                        <button className="btn-whatsapp" onClick={handleWhatsAppShare}>
                            <Send size={18} />
                            Enviar Zap
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default BudgetModal;
