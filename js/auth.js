// Sign up new user
async function signUp(email, password, fullName) {
    try {
        const { error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {
                    full_name: fullName
                }
            }
        });

        if (error) {
            alert('Error: ' + error.message);
            return;
        }

        alert('Sign up successful! Please check your email to verify.');
        window.location.href = 'login.html';
    } catch (err) {
        console.error('Sign up error:', err);
    }
}



async function login(email, password) {
    try {
        const { error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            alert('Login failed: ' + error.message);
            return;
        }

        alert('Login successful!');
        window.location.href = 'index.html';
    } catch (err) {
        console.error('Login error:', err);
    }
}





async function checkAuth() {
    const { data: { user } } = await supabase.auth.getUser();
    const authLink = document.getElementById('auth-link');
    
    if (!authLink) {
        return user || null;
    }
    
    if (user) {
        // User is logged in
        authLink.textContent = 'Logout';
        authLink.href = '#';
        authLink.addEventListener('click', logout);
        return user;
    } else {
        // User is not logged in
        authLink.textContent = 'Login';
        authLink.href = 'login.html';
        return null;
    }
}

async function logout() {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
}

// Run on page load
checkAuth();