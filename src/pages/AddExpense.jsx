import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaBackspace, FaUtensils, FaBus, FaShoppingBag, FaFilm, FaFileInvoiceDollar } from 'react-icons/fa';

const categories = [
    { id: 'food', name: 'Food', icon: <FaUtensils /> },
    { id: 'transport', name: 'Transport', icon: <FaBus /> },
    { id: 'shopping', name: 'Shopping', icon: <FaShoppingBag /> },
    { id: 'entertainment', name: 'Fun', icon: <FaFilm /> },
    { id: 'bills', name: 'Bills', icon: <FaFileInvoiceDollar /> },
];

import { finance } from '../services/api';

const AddExpense = ({ onBack, onAdd }) => {
    const [amount, setAmount] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(categories[0].id);
    const [note, setNote] = useState('');
    const [loading, setLoading] = useState(false);
    const [scanning, setScanning] = useState(false);

    // --- HELPER: English to Number Parser ---
    const textToNumber = (text) => {
        const small = {
            'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
            'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19,
            'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90
        };
        const magnitude = { 'hundred': 100, 'thousand': 1000, 'lakh': 100000, 'crore': 10000000 };

        const words = text.toLowerCase().replace(/-/g, ' ').replace(/[^\w\s]/g, '').split(/\s+/);
        let total = 0;
        let current = 0;

        let foundAny = false;

        words.forEach(word => {
            if (small[word] != null) {
                current += small[word];
                foundAny = true;
            } else if (magnitude[word] != null) {
                current = (current === 0 ? 1 : current) * magnitude[word];
                total += current;
                current = 0;
                foundAny = true;
            } else if (word === 'and') {
                // skip
            } else {
                // Break sequence? For specific isolated parsing, likely ok to ignore junk
            }
        });

        return foundAny ? total + current : null;
    };

    const handleScan = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setScanning(true);

        try {
            const { data: { text } } = await Tesseract.recognize(file, 'eng', {
                logger: m => console.log(m)
            });

            console.log("OCR Match Text:", text);

            // --- 1. CLEANING ---
            // Aggressive Leetspeak Cleaning for Digit-Like strings
            // We do this carefully: replace letters only if they look like part of a number format
            const cleanText = text
                .replace(/(\d)o/gi, '$10').replace(/o(\d)/gi, '0$1')
                .replace(/l(\d)/gi, '1$1').replace(/(\d)i/gi, '$11')
                .replace(/(\d)s/gi, '$15').replace(/s(\d)/gi, '5$1') // S -> 5
                .replace(/(\d)b/gi, '$18').replace(/b(\d)/gi, '8$1') // B -> 8
                .replace(/(\d)z/gi, '$12').replace(/z(\d)/gi, '2$1'); // Z -> 2

            const lowerText = cleanText.toLowerCase();
            const lines = cleanText.split('\n').filter(l => l.trim().length > 0);

            let candidates = [];

            // --- 2. LOOP LINES ---
            lines.forEach((line, index) => {
                const lowerLine = line.toLowerCase();

                // A. DIGIT EXTRACTION
                // Regex allows for commas, dots, and even spaces between thousands if context implies
                const matches = line.matchAll(/(?:₹|Rs\.?|INR)?\s*([\d,]+[\. ]?\d{0,2})/gi);

                for (const match of matches) {
                    // Fix spaces in numbers like "2 500" if matched
                    let rawVal = match[1].replace(/,/g, '').replace(/\s/g, '');
                    if (!rawVal || rawVal === '.') continue;
                    let val = parseFloat(rawVal);
                    if (isNaN(val)) continue;

                    let score = 0;
                    // Context Scoring
                    if (lowerLine.includes('total') || lowerLine.includes('amount') || lowerLine.includes('payable') || lowerLine.includes('paid')) score += 50;
                    if (lowerLine.includes('bill') || lowerLine.includes('due')) score += 30;
                    if (line.includes('₹') || lowerLine.includes('rs') || line.includes('INR')) score += 20;
                    if (val > 10 && val < 50000) score += 10;
                    if (val >= 1990 && val <= 2030 && Number.isInteger(val)) score -= 50;
                    if (val < 1) score -= 10;
                    if (val > 100000) score -= 100;
                    if (rawVal.includes('.')) score += 15;
                    if (index > 0) {
                        const prevLine = lines[index - 1].toLowerCase();
                        if (prevLine.includes('total') || prevLine.includes('amount')) score += 40;
                    }
                    candidates.push({ val, score, raw: rawVal });
                }

                // B. TEXTUAL NUMBER PARSING (English Words)
                // e.g. "Rupees Five Hundred Only"
                const textVal = textToNumber(line);
                if (textVal && textVal > 0) {
                    let score = 30; // Base score for explicit text
                    if (lowerLine.includes('total') || lowerLine.includes('only') || lowerLine.includes('rupees')) score += 40;
                    if (index > 0) {
                        const prevLine = lines[index - 1].toLowerCase();
                        if (prevLine.includes('total')) score += 40;
                    }
                    candidates.push({ val: textVal, score, raw: 'Text: ' + textVal });
                }
            });

            // --- 3. SELECTION ---
            candidates.sort((a, b) => b.score - a.score);
            let detectedAmount = (candidates.length > 0 && candidates[0].score > -20) ? candidates[0].val.toString() : '0';


            // --- 4. CATEGORIZATION & NAMING (Preserved) ---
            const catScores = { food: 0, transport: 0, shopping: 0, entertainment: 0, bills: 0 };
            const detectedKeywords = [];

            const dictionary = {
                food: ['zomato', 'swiggy', 'eats', 'food', 'restaurant', 'cafe', 'bistro', 'diner', 'kitchen', 'bar', 'pub', 'bakery', 'sweets', 'mcdonalds', 'kfc', 'dominos', 'pizza', 'burger', 'king', 'subway', 'starbucks', 'coffee', 'tea', 'chai', 'biryani', 'kebab', 'tandoor', 'thali', 'breakfast', 'lunch', 'dinner', 'menu', 'table', 'dine', 'mess', 'hotel', 'serving'],
                transport: ['uber', 'ola', 'rapido', 'lyft', 'ride', 'trip', 'cab', 'taxi', 'auto', 'driver', 'fare', 'fuel', 'petrol', 'diesel', 'gas', 'cng', 'shell', 'hp', 'indian oil', 'pump', 'station', 'parking', 'toll', 'fastag', 'metro', 'train', 'bus', 'flight', 'airline', 'ticket'],
                shopping: ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'nykaa', 'retail', 'store', 'mart', 'market', 'mall', 'zara', 'h&m', 'trends', 'zudio', 'max', 'pantaloons', 'westside', 'decathlon', 'ikea', 'clothing', 'apparel', 'fashion', 'garments', 'textile', 'silk', 'saree', 'boutique', 'grocery', 'supermarket'],
                bills: ['bill', 'recharge', 'topup', 'prepaid', 'postpaid', 'broadband', 'wifi', 'fiber', 'internet', 'electricity', 'power', 'bescom', 'water', 'gas', 'cylinder', 'lpg', 'indane', 'airtel', 'jio', 'vi', 'vodafone', 'bsnl', 'act', 'tax', 'utgst', 'cgst', 'sgst'],
                entertainment: ['movie', 'cinema', 'theatre', 'film', 'show', 'screen', 'multiplex', 'imax', 'pvr', 'inox', 'cinepolis', 'bookmyshow', 'netflix', 'prime', 'hotstar', 'spotify', 'youtube', 'subscription', 'game', 'gaming', 'fun', 'park', 'resort']
            };

            Object.keys(dictionary).forEach(cat => {
                dictionary[cat].forEach(word => {
                    if (lowerText.includes(word)) {
                        catScores[cat] += 5;
                        const regex = new RegExp(`\\b${word}\\b`, 'i');
                        if (regex.test(lowerText)) catScores[cat] += 10;
                        detectedKeywords.push({ word, cat });
                    }
                });
            });

            if (lowerText.includes('table no') || lowerText.includes('server')) catScores.food += 15;
            if (lowerText.includes('vehicle') || lowerText.includes('km')) catScores.transport += 15;
            if (lowerText.includes('shipping') || lowerText.includes('delivery')) catScores.shopping += 10;
            if (lowerText.includes('gstin') && !catScores.food) catScores.shopping += 5;

            let bestCat = 'bills';
            let maxScore = -1;
            Object.entries(catScores).forEach(([cat, score]) => {
                if (score > maxScore) { maxScore = score; bestCat = cat; }
            });
            if (maxScore < 10) {
                if (lowerText.includes('airtel') || lowerText.includes('jio')) bestCat = 'bills';
                if (lowerText.includes('uber') || lowerText.includes('ola')) bestCat = 'transport';
            }

            let detectedNote = "Scanned Receipt";
            detectedKeywords.sort((a, b) => b.word.length - a.word.length);
            const bestKw = detectedKeywords.find(k => k.cat === bestCat);

            if (bestKw) {
                detectedNote = bestKw.word.split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                if (bestCat === 'bills' && !detectedNote.toLowerCase().includes('bill')) detectedNote += ' Bill';
            } else {
                for (let i = 0; i < Math.min(lines.length, 6); i++) {
                    const l = lines[i].trim();
                    const isTitleLike = l.length > 3 && l.length < 30 && !l.match(/[\d:]/);
                    if (isTitleLike) { detectedNote = l; break; }
                }
            }
            if (lowerText.includes('airtel') && (lowerText.includes('recharge') || lowerText.includes('prepaid'))) detectedNote = "Airtel Recharge";
            if (lowerText.includes('swiggy')) detectedNote = "Swiggy Order";
            if (lowerText.includes('zomato')) detectedNote = "Zomato Order";
            if (lowerText.includes('uber')) detectedNote = "Uber Ride";

            setAmount(detectedAmount);
            setNote(detectedNote);
            setSelectedCategory(bestCat);

            alert(`Smart Scan Complete! 📸\n\nIdentified: ${detectedNote}\nCategory: ${categories.find(c => c.id === bestCat)?.name}\nAmount: ₹${detectedAmount}`);

        } catch (err) {
            console.error(err);
            alert("Failed to read image. Please try a clearer photo.");
        } finally {
            setScanning(false);
        }
    };

    const handleNumClick = (num) => {
        if (amount.length < 8) setAmount(prev => prev + num);
    };

    const handleBackspace = () => {
        setAmount(prev => prev.slice(0, -1));
    };

    const handleSubmit = async () => {
        if (!amount) return;
        setLoading(true);
        try {
            await finance.addExpense({
                amount: parseFloat(amount),
                categoryId: null,
                note,
                txnTime: new Date()
            });
            onAdd();
        } catch (error) {
            console.error(error);
            alert("Failed to add expense");
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
        >
            {/* Header */}
            <div style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button onClick={onBack} className="glass" style={{ padding: '12px', borderRadius: '50%' }}>
                        <FaArrowLeft color="#fff" />
                    </button>
                    <span style={{ marginLeft: '16px', fontSize: '18px', fontWeight: '600' }}>Add Expense</span>
                </div>

                {/* Smart Scan Button */}
                <label className="glass" style={{
                    padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px',
                    cursor: 'pointer', background: 'rgba(140, 82, 255, 0.2)', border: '1px solid rgba(140, 82, 255, 0.4)'
                }}>
                    <FaFileInvoiceDollar color="#fff" />
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>Smart Scan</span>
                    <input type="file" accept="image/*" onChange={handleScan} style={{ display: 'none' }} />
                </label>
            </div>

            {/* Scanning Overlay */}
            {scanning && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10,
                    background: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                }}>
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        style={{ width: '80px', height: '80px', borderRadius: '20px', border: '4px solid var(--primary-color)', marginBottom: '24px' }}
                    />
                    <h3 style={{ fontSize: '20px', fontWeight: '600' }}>Reading Receipt...</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Parsing Text & Numbers</p>
                </div>
            )}

            {/* Display */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '48px', fontWeight: '700', marginBottom: '8px' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '32px' }}>₹</span>
                    {amount || '0'}
                </div>
                <input
                    type="text"
                    placeholder="Add a note..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    style={{
                        background: 'transparent', border: 'none', color: 'var(--text-secondary)',
                        textAlign: 'center', fontSize: '16px', width: '80%'
                    }}
                />
            </div>

            {/* Category Scroll */}
            <div style={{ padding: '20px 0', overflowX: 'auto', display: 'flex', gap: '16px', paddingLeft: '24px' }}>
                {categories.map(cat => (
                    <div
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '70px',
                            opacity: selectedCategory === cat.id ? 1 : 0.5, transform: selectedCategory === cat.id ? 'scale(1.1)' : 'scale(1)',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div className="glass" style={{
                            width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: selectedCategory === cat.id ? 'var(--primary-color)' : 'var(--glass-bg)'
                        }}>
                            {React.cloneElement(cat.icon, { size: 24, color: '#fff' })}
                        </div>
                        <span style={{ fontSize: '12px', color: '#fff' }}>{cat.name}</span>
                    </div>
                ))}
            </div>

            {/* Keypad */}
            <div className="glass-card" style={{
                borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
                padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px'
            }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map(key => (
                    <button
                        key={key}
                        onClick={() => handleNumClick(key)}
                        style={{
                            padding: '20px', fontSize: '24px', fontWeight: '600', color: '#fff', background: 'transparent'
                        }}
                    >
                        {key}
                    </button>
                ))}
                <button onClick={handleBackspace} style={{ background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaBackspace size={24} color="var(--text-secondary)" />
                </button>
            </div>

            <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                    margin: '16px 24px 32px', padding: '18px', borderRadius: '16px',
                    background: 'linear-gradient(90deg, var(--success), #00C853)',
                    color: '#fff', fontSize: '18px', fontWeight: '700',
                    boxShadow: '0 4px 20px rgba(0, 224, 150, 0.4)',
                    opacity: loading ? 0.7 : 1
                }}
            >
                {loading ? 'Adding...' : 'Add Expense'}
            </button>

        </motion.div>
    );
};

export default AddExpense;
