document.addEventListener('DOMContentLoaded', function () {
    const searchForm = document.getElementById('searchForm');
    const hostelsDiv = document.getElementById('hostels');

    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const minPrice = document.getElementById('minPrice').value || 0;
        const maxPrice = document.getElementById('maxPrice').value || Number.MAX_SAFE_INTEGER;
        fetchHostels(minPrice, maxPrice);
    });

    function fetchHostels(minPrice = 0, maxPrice = Number.MAX_SAFE_INTEGER) {
        fetch(`http://localhost:3000/hostels/search?minPrice=${minPrice}&maxPrice=${maxPrice}`)
            .then((response) => response.json())
            .then((data) => {
                hostelsDiv.innerHTML = ''; // Clear previous results
                if (data.length === 0) {
                    hostelsDiv.innerHTML = '<p>No hostels found within the specified price range.</p>';
                } else {
                    data.forEach((hostel) => {
                        const hostelDiv = document.createElement('div');
                        hostelDiv.className = 'hostel';

                        const name = document.createElement('h2');
                        name.textContent = hostel.name;
                        hostelDiv.appendChild(name);

                        const location = document.createElement('p');
                        location.textContent = `Location: ${hostel.location}`;
                        hostelDiv.appendChild(location);

                        const price = document.createElement('p');
                        price.textContent = `Price: ${hostel.price}`;
                        hostelDiv.appendChild(price);

                        const amenities = document.createElement('p');
                        amenities.textContent = `Amenities: ${hostel.amenities.join(', ')}`;
                        hostelDiv.appendChild(amenities);

                        const rating = document.createElement('p');
                        rating.textContent = `Rating: ${hostel.rating}`;
                        hostelDiv.appendChild(rating);

                        hostelsDiv.appendChild(hostelDiv);
                    });
                }
            })
            .catch((error) => console.error('Error fetching hostels:', error));
    }

    fetchHostels();

    // Google Sign-In
    window.onSignIn = function (googleUser) {
        const idToken = googleUser.getAuthResponse().id_token;
        fetch('http://localhost:3000/api/google-signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: idToken }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    console.log('User logged in successfully:', data.userid);
                } else {
                    console.log('Sign-in failed:', data.message);
                }
            })
            .catch((error) => console.error('Error during sign-in:', error));
    };
});