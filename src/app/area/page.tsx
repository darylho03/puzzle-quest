import Area from '../../components/Area';

export default function HomePage() {
    return (
        <div className="app">
            <div className="description">
                <p>Area (Nurikabe) Rules:</p>
                <p>Fill the grid with black and white cells while following these rules:</p>
                <ul>
                    <li>All black cells must be orthogonally connected.</li>
                    <li>Each white region must have exactly 1 numbered cell.</li>
                    <li>Numbers in white cells represent the number of white cells that are inside of its region.</li>
                    <li style={{color: 'red'}}>DISCLAIMER: This puzzle does not currently generate with a unique solution, so multiple solutions may exist. I intend to fix this soon.</li>
                </ul>
            </div>
            <Area />
        </div>
    );
}