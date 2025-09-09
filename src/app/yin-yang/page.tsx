import YinYang from '../../components/YinYang';

export default function HomePage() {
    return (
        <div className="app">
            <YinYang />
            <div className="description">
                <p>Yin Yang Rules:</p>
                <p>Fill the grid with black and white cells while following these rules:</p>
                <ul>
                    <li>All white cells must be orthogonally connected.</li>
                    <li>All black cells must be orthogonally connected.</li>
                    <li>No 2x2 square can be filled with the same color.</li>
                </ul>
            </div>
        </div>
    );
}