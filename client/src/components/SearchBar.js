import React from 'react';

const SearchBar = () => {
    return (
        <div style={{ width: 186, height: 40, left: 863, top: 22, position: 'absolute' }}>
            <div style={{ width: 186, height: 40, left: 0, top: 0, position: 'absolute', background: '#F4F6F8', borderRadius: 10 }} />
            <div style={{ width: 78, height: 26, left: 70.47, top: 7, position: 'absolute', textAlign: 'right', color: 'black', fontSize: 16, fontWeight: '500', letterSpacing: 0.10, wordWrap: 'break-word' }}>Search</div>
            <div data-svg-wrapper style={{ left: 38, top: 9.86, position: 'absolute' }}>
                <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.7416 17.2839L15.0415 13.5844C14.8745 13.4174 14.6482 13.3247 14.4106 13.3247H13.8057C14.83 12.0148 15.4386 10.3673 15.4386 8.57514C15.4386 4.31169 11.9835 0.857143 7.71933 0.857143C3.45516 0.857143 1.99318e-05 4.31169 1.99318e-05 8.57514C1.99318e-05 12.8386 3.45516 16.2931 7.71933 16.2931C9.51185 16.2931 11.1596 15.6846 12.4697 14.6605V15.2653C12.4697 15.5028 12.5625 15.7291 12.7295 15.8961L16.4295 19.5955C16.7784 19.9443 17.3425 19.9443 17.6876 19.5955L18.7379 18.5455C19.0868 18.1967 19.0868 17.6327 18.7416 17.2839ZM7.71933 13.3247C5.09551 13.3247 2.96899 11.2022 2.96899 8.57514C2.96899 5.95176 5.0918 3.8256 7.71933 3.8256C10.3432 3.8256 12.4697 5.94805 12.4697 8.57514C12.4697 11.1985 10.3469 13.3247 7.71933 13.3247Z" fill="black" />
                </svg>
            </div>
        </div>
    );
};

export default SearchBar;