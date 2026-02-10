// Authentication Functions

// Check if user is logged in and update UI
async function checkAuth() {
    // Make sure supabase is initialized
    if (typeof supabase === 'undefined' || !supabase.auth) {
        console.error('Supabase not initialized yet');
        return null;
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        const authLink = document.getElementById('auth-link');
        
        // If auth-link doesn't exist on this page, just return user status
        if (!authLink) {
            return user || null;
        }
        
        if (user && !error) {
            // User is logged in
            authLink.textContent = 'Logout';
            authLink.href = '#';
            authLink.onclick = (e) => {
                e.preventDefault();
                logout();
            };
            return user;
        } else {
            // User is not logged in
            authLink.textContent = 'Login';
            authLink.href = 'login.html';
            authLink.onclick = null;
            return null;
        }
    } catch (err) {
        console.error('Auth check error:', err);
        return null;
    }
}

// Logout function
async function logout() {
    if (typeof supabase === 'undefined') {
        console.error('Supabase not initialized');
        return;
    }
    
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            console.error('Logout error:', error);
            alert('Error logging out');
        } else {
            alert('Logged out successfully');
            window.location.href = 'index.html';
        }
    } catch (err) {
        console.error('Logout error:', err);
    }
}

// Sign up function
async function signUp(email, password, fullName) {
    if (typeof supabase === 'undefined') {
        alert('System not ready. Please refresh the page.');
        return null;
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });

        if (error) {
            alert('Sign up failed: ' + error.message);
            return null;
        }

        alert('Sign up successful! Please check your email to verify your account.');
        return data;
    } catch (err) {
        console.error('Sign up error:', err);
        alert('An error occurred during sign up');
        return null;
    }
}

// Login function
async function login(email, password) {
    if (typeof supabase === 'undefined') {
        alert('System not ready. Please refresh the page.');
        return null;
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            alert('Login failed: ' + error.message);
            return null;
        }

        alert('Login successful!');
        return data;
    } catch (err) {
        console.error('Login error:', err);
        alert('An error occurred during login');
        return null;
    }
}

// Run auth check when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Add a small delay to ensure supabase is initialized
        setTimeout(checkAuth, 100);
    });
} else {
    // DOM already loaded, but wait a moment for supabase
    setTimeout(checkAuth, 100);
}