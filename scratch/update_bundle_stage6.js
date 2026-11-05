// Upgrade build_bundle.js with Stage 6 Customer Authentication
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = path.resolve(__dirname, '..');
const bundlePath = path.join(projectDir, 'build_bundle.js');

let code = fs.readFileSync(bundlePath, 'utf8');

// 1. Updated Navbar with full customer profile integration, name display, and logout
const updatedNavbarCode = `    // 2. NAVBAR COMPONENT (WITH CUSTOMER PROFILE & AUTHENTICATION INTEGRATION)
    function Navbar({ activePage, setActivePage, cartCount = 0, currentUser = null, customerProfile = null, onLogout = null }) {
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
      const [userDropdownOpen, setUserDropdownOpen] = useState(false);

      const navItems = [
        { id: 'home', label: 'Home', icon: 'home' },
        { id: 'menu', label: 'Full Menu', icon: 'restaurant_menu' },
        { id: 'cart', label: 'Cart (' + cartCount + ')', icon: 'shopping_bag' },
        { id: 'orders', label: 'Orders & Tracking', icon: 'moped' },
        { id: 'admin', label: 'Staff Hub', icon: 'soup_kitchen' }
      ];

      const handleNav = (id) => {
        setActivePage(id);
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      };

      const displayName =
        (customerProfile && customerProfile.full_name) ||
        (currentUser && currentUser.user_metadata && currentUser.user_metadata.full_name) ||
        (currentUser && currentUser.email ? currentUser.email.split('@')[0] : null);

      const initial = displayName ? displayName.charAt(0).toUpperCase() : 'C';

      return h('header', { className: 'fixed top-0 left-0 right-0 z-50 bg-[#fff9ed]/95 backdrop-blur-xl shadow-[0_2px_12px_rgba(61,35,20,0.06)]' },
        // Top Announcement Bar
        h('div', { className: 'bg-[#250f03] text-white px-4 text-center py-1 flex items-center justify-center gap-2 text-xs' },
          h('span', { className: 'material-symbols-outlined text-[#fd6c19] text-sm' }, 'local_cafe'),
          h('span', { className: 'tracking-wide' }, 'Fresh hot Salem Filter Kaapi & Crispy Medu Vadas brewing right now! Cash on Delivery available.')
        ),
        // Main Nav
        h('div', { className: 'h-20 max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between gap-4' },
          h('div', { className: 'flex items-center gap-4' },
            h('button', {
              onClick: () => handleNav('home'),
              className: 'flex items-center gap-2 text-left focus:outline-none'
            },
              h('img', {
                alt: 'Eswar, Bala & Co Logo',
                className: 'h-8 w-auto object-contain',
                src: 'https://lh3.googleusercontent.com/aida/AEtjO1XZs9MuMQKEmNvDzp1fMXF7K-DJXdpK_tost2i6v0lD59W7LBOjThUtUpisLVlvNdB8IwESWp3YMEIz3UMLG4R7onvrczC-mRpVmSd3avF_Iw-Ou5iuAuBduesqysWyijXTFVO_LkIGAdn1UVZsNVgTfxnrGw7a3bSCkUIFdunbNPwX5tT2Lehj0bMenzqh-nIJTQ5jSy_TLmUi9rfiGikD3YeqK8aqo4Enau7WGkDKPQ'
              }),
              h('div', { className: 'flex flex-col' },
                h('span', { className: 'font-bold text-lg text-[#250f03] leading-tight font-serif' }, 'Eswar, Bala & Co'),
                h('span', { className: 'text-xs text-[#a23f00] leading-none' }, 'Salem Bypass & Junction Rd')
              )
            ),
            h('div', { className: 'hidden xl:flex items-center gap-1.5 bg-[#ede8dc] px-3 py-1 rounded-full' },
              h('span', { className: 'w-2 h-2 rounded-full bg-[#fd6c19] animate-pulse' }),
              h('span', { className: 'text-xs text-[#50443f]' }, 'Open Now • 6:30 AM - 11:00 PM')
            )
          ),

          // Center nav items
          h('nav', { className: 'hidden lg:flex items-center gap-1' },
            navItems.map((item) =>
              h('button', {
                key: item.id,
                onClick: () => handleNav(item.id),
                className: 'px-4 py-2 font-medium text-sm rounded-lg transition-colors ' +
                  (activePage === item.id ? 'bg-[#3d2314] text-white shadow-sm' : 'text-[#50443f] hover:bg-[#ede8dc] hover:text-[#1d1c14]')
              }, item.label)
            )
          ),

          // Right CTAs & Profile
          h('div', { className: 'flex items-center gap-3' },
            h('a', {
              href: 'tel:+919443210890',
              className: 'hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f3ede1] text-[#50443f] hover:bg-[#ede8dc] transition-colors'
            },
              h('span', { className: 'material-symbols-outlined text-[#a23f00] text-sm' }, 'call'),
              h('span', { className: 'text-xs font-semibold text-[#1d1c14]' }, '+91 94432 10890')
            ),

            // Cart button
            h('button', {
              onClick: () => handleNav('cart'),
              className: 'relative p-2.5 rounded-full bg-[#fd6c19] text-white hover:bg-[#a23f00] transition-colors flex items-center justify-center shadow-md active:scale-95',
              'aria-label': 'View Cart'
            },
              h('span', { className: 'material-symbols-outlined text-lg' }, 'shopping_bag'),
              cartCount > 0 && h('span', {
                className: 'absolute -top-1 -right-1 bg-[#250f03] text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full ring-2 ring-[#fff9ed]'
              }, cartCount)
            ),

            // Logged-in Customer Badge & Dropdown OR Login/Register Buttons
            currentUser
              ? h('div', { className: 'relative' },
                  h('button', {
                    onClick: () => setUserDropdownOpen(!userDropdownOpen),
                    className: 'flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f3ede1] hover:bg-[#ede8dc] border border-[#e8e2d6] transition-all'
                  },
                    h('div', { className: 'w-7 h-7 rounded-full bg-[#250f03] text-white font-bold text-xs flex items-center justify-center' }, initial),
                    h('span', { className: 'hidden md:inline-block text-xs font-bold text-[#250f03] max-w-[120px] truncate' }, displayName),
                    h('span', { className: 'material-symbols-outlined text-xs text-[#82746e]' }, userDropdownOpen ? 'expand_less' : 'expand_more')
                  ),
                  userDropdownOpen && h('div', { className: 'absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#e8e2d6] py-2 z-50' },
                    h('div', { className: 'px-4 py-2 border-b border-[#f3ede1]' },
                      h('p', { className: 'text-xs font-bold text-[#250f03] truncate' }, displayName),
                      h('p', { className: 'text-[11px] text-[#82746e] truncate' }, currentUser.email),
                      customerProfile && customerProfile.role && h('span', {
                        className: 'inline-block mt-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900'
                      }, customerProfile.role)
                    ),
                    h('button', {
                      onClick: () => handleNav('orders'),
                      className: 'w-full text-left px-4 py-2 text-xs text-[#250f03] hover:bg-[#f9f3e7] flex items-center gap-2'
                    },
                      h('span', { className: 'material-symbols-outlined text-sm text-[#a23f00]' }, 'moped'),
                      h('span', null, 'My Orders & Tracking')
                    ),
                    h('button', {
                      onClick: () => {
                        setUserDropdownOpen(false);
                        if (onLogout) onLogout();
                      },
                      className: 'w-full text-left px-4 py-2 text-xs text-red-700 hover:bg-red-50 flex items-center gap-2 border-t border-[#f3ede1] mt-1'
                    },
                      h('span', { className: 'material-symbols-outlined text-sm' }, 'logout'),
                      h('span', null, 'Log Out')
                    )
                  )
                )
              : h('div', { className: 'hidden sm:flex items-center gap-2' },
                  h('button', {
                    onClick: () => handleNav('login'),
                    className: 'px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#250f03] hover:bg-[#ede8dc] transition-colors'
                  }, 'Sign In'),
                  h('button', {
                    onClick: () => handleNav('register'),
                    className: 'px-3.5 py-1.5 rounded-xl bg-[#250f03] hover:bg-[#a23f00] text-white text-xs font-bold transition-colors shadow-sm'
                  }, 'Register')
                ),

            // Mobile Hamburger
            h('button', {
              onClick: () => setMobileMenuOpen(!mobileMenuOpen),
              className: 'lg:hidden p-2 rounded-lg text-[#250f03] hover:bg-[#ede8dc] transition-colors focus:outline-none',
              'aria-label': 'Toggle Navigation Menu'
            },
              h('span', { className: 'material-symbols-outlined text-2xl' }, mobileMenuOpen ? 'close' : 'menu')
            )
          )
        ),

        // Mobile drawer menu
        mobileMenuOpen && h('div', { className: 'lg:hidden bg-[#fff9ed] border-t border-[#e8e2d6] px-4 py-3 shadow-xl' },
          h('div', { className: 'flex flex-col gap-1' },
            currentUser
              ? h('div', { className: 'p-3 bg-[#f3ede1] rounded-xl flex items-center justify-between mb-2' },
                  h('div', { className: 'flex items-center gap-2.5 truncate' },
                    h('div', { className: 'w-8 h-8 rounded-full bg-[#250f03] text-white font-bold text-xs flex items-center justify-center shrink-0' }, initial),
                    h('div', { className: 'truncate' },
                      h('p', { className: 'font-bold text-xs text-[#250f03] truncate' }, displayName),
                      h('p', { className: 'text-[10px] text-[#82746e] truncate' }, currentUser.email)
                    )
                  ),
                  h('button', {
                    onClick: () => {
                      setMobileMenuOpen(false);
                      if (onLogout) onLogout();
                    },
                    className: 'p-1.5 text-red-700 hover:bg-white rounded-lg flex items-center gap-1 text-xs font-bold shrink-0'
                  },
                    h('span', { className: 'material-symbols-outlined text-sm' }, 'logout'),
                    h('span', null, 'Exit')
                  )
                )
              : h('div', { className: 'grid grid-cols-2 gap-2 mb-2' },
                  h('button', {
                    onClick: () => handleNav('login'),
                    className: 'py-2.5 px-3 bg-[#f3ede1] hover:bg-[#ede8dc] text-[#250f03] text-xs font-bold rounded-xl text-center'
                  }, 'Sign In'),
                  h('button', {
                    onClick: () => handleNav('register'),
                    className: 'py-2.5 px-3 bg-[#250f03] text-white text-xs font-bold rounded-xl text-center shadow-sm'
                  }, 'Register')
                ),
            navItems.map((item) =>
              h('button', {
                key: item.id,
                onClick: () => handleNav(item.id),
                className: 'flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm font-semibold transition-colors ' +
                  (activePage === item.id ? 'bg-[#3d2314] text-white shadow-sm' : 'text-[#50443f] hover:bg-[#ede8dc] hover:text-[#1d1c14]')
              },
                h('span', { className: 'material-symbols-outlined text-lg' }, item.icon),
                h('span', null, item.label)
              )
            ),
            h('div', { className: 'pt-2 mt-2 border-t border-[#ede8dc] flex items-center justify-between text-xs text-[#50443f]' },
              h('span', { className: 'flex items-center gap-1' },
                h('span', { className: 'w-2 h-2 rounded-full bg-[#fd6c19] animate-pulse' }),
                h('span', null, 'Open 6:30 AM - 11:00 PM')
              ),
              h('a', { href: 'tel:+919443210890', className: 'font-bold text-[#a23f00] flex items-center gap-1' },
                h('span', { className: 'material-symbols-outlined text-sm' }, 'call'),
                h('span', null, 'Call Kitchen')
              )
            )
          )
        )
      );
    }`;

// 2. Login Page Component
const loginComponentCode = `    // 8.5. LOGIN PAGE COMPONENT
    function Login({ onNavigate, onLoginSuccess, redirectTarget = null, redirectNotice = null }) {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [showPassword, setShowPassword] = useState(false);
      const [loading, setLoading] = useState(false);
      const [errorMessage, setErrorMessage] = useState(null);
      const [successMessage, setSuccessMessage] = useState(null);

      const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        const cleanEmail = email.trim();
        if (!cleanEmail) {
          setErrorMessage('Please enter your email address.');
          return;
        }
        if (!password) {
          setErrorMessage('Please enter your password.');
          return;
        }

        const sb = getSupabase();
        if (!sb || !sb.auth) {
          setErrorMessage('Supabase auth is not available.');
          return;
        }

        setLoading(true);
        try {
          const { data, error } = await sb.auth.signInWithPassword({
            email: cleanEmail,
            password: password
          });

          if (error) throw error;

          if (data && data.user) {
            setSuccessMessage('Welcome back! Signed in successfully.');
            if (onLoginSuccess) onLoginSuccess(data.user);
            setTimeout(() => {
              onNavigate(redirectTarget || 'home');
            }, 500);
          }
        } catch (err) {
          console.error('Login error:', err);
          let msg = err.message || 'Failed to sign in. Please check your credentials.';
          if (err.message && err.message.indexOf('Invalid login credentials') !== -1) {
            msg = 'Incorrect email or password. Please verify your credentials or register a new account.';
          }
          setErrorMessage(msg);
        } finally {
          setLoading(false);
        }
      };

      const handleDemoLogin = async () => {
        setEmail('karthik.salemcafe@gmail.com');
        setPassword('SalemKaapi@2025!');
        setErrorMessage(null);
        const sb = getSupabase();
        if (!sb || !sb.auth) return;

        setLoading(true);
        try {
          const { data, error } = await sb.auth.signInWithPassword({
            email: 'karthik.salemcafe@gmail.com',
            password: 'SalemKaapi@2025!'
          });

          if (error) {
            // Attempt auto register if demo user does not exist
            const { data: regData, error: regError } = await sb.auth.signUp({
              email: 'karthik.salemcafe@gmail.com',
              password: 'SalemKaapi@2025!',
              options: {
                data: {
                  full_name: 'Karthik Subramanian',
                  phone: '+91 94432 10890'
                }
              }
            });
            if (regError) throw regError;
            if (regData && regData.user) {
              setSuccessMessage('Demo customer account initialized and signed in!');
              if (onLoginSuccess) onLoginSuccess(regData.user);
              setTimeout(() => onNavigate(redirectTarget || 'home'), 500);
              return;
            }
          }

          if (data && data.user) {
            setSuccessMessage('Signed in as Karthik Subramanian!');
            if (onLoginSuccess) onLoginSuccess(data.user);
            setTimeout(() => onNavigate(redirectTarget || 'home'), 500);
          }
        } catch (err) {
          setErrorMessage(err.message || 'Demo login could not complete.');
        } finally {
          setLoading(false);
        }
      };

      return h('div', { className: 'max-w-md mx-auto px-4 py-12 w-full' },
        h('div', { className: 'text-center mb-8' },
          h('div', { className: 'inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f3ede1] shadow-sm mb-3' },
            h('span', { className: 'material-symbols-outlined text-[#a23f00] text-3xl' }, 'local_cafe')
          ),
          h('h1', { className: 'font-serif text-3xl font-bold text-[#250f03]' }, 'Welcome Back'),
          h('p', { className: 'text-xs text-[#a23f00] font-semibold uppercase tracking-wider mt-1' },
            'Smart Café Salem • Customer Portal'
          )
        ),

        redirectNotice && h('div', { className: 'mb-6 bg-amber-50 border border-amber-200 text-amber-900 p-3.5 rounded-xl flex items-center gap-2.5 text-xs' },
          h('span', { className: 'material-symbols-outlined text-amber-700 text-base' }, 'lock'),
          h('span', { className: 'font-medium' }, redirectNotice)
        ),

        errorMessage && h('div', { className: 'mb-6 bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl flex items-start gap-2.5 text-xs' },
          h('span', { className: 'material-symbols-outlined text-red-600 text-base shrink-0 mt-0.5' }, 'error'),
          h('div', { className: 'flex-1' }, errorMessage),
          h('button', { onClick: () => setErrorMessage(null), className: 'text-red-700 font-bold hover:underline shrink-0' }, '✕')
        ),

        successMessage && h('div', { className: 'mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl flex items-center gap-2.5 text-xs' },
          h('span', { className: 'material-symbols-outlined text-emerald-600 text-base' }, 'check_circle'),
          h('span', { className: 'font-medium' }, successMessage)
        ),

        h('div', { className: 'bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e8e2d6]' },
          h('form', { onSubmit: handleSubmit, className: 'flex flex-col gap-4' },
            h('div', { className: 'flex flex-col gap-1.5' },
              h('label', { className: 'text-xs font-bold text-[#250f03] flex items-center gap-1.5' },
                h('span', { className: 'material-symbols-outlined text-sm text-[#a23f00]' }, 'mail'),
                h('span', null, 'Email Address')
              ),
              h('input', {
                type: 'email',
                required: true,
                autoFocus: true,
                value: email,
                onChange: (e) => setEmail(e.target.value),
                placeholder: 'e.g. karthik.salem@gmail.com',
                className: 'w-full bg-[#f9f3e7] px-3.5 py-2.5 rounded-xl text-xs text-[#1d1c14] border border-[#e8e2d6] focus:outline-none focus:ring-2 focus:ring-[#fd6c19] focus:bg-white transition-all'
              })
            ),
            h('div', { className: 'flex flex-col gap-1.5' },
              h('label', { className: 'text-xs font-bold text-[#250f03] flex items-center gap-1.5' },
                h('span', { className: 'material-symbols-outlined text-sm text-[#a23f00]' }, 'lock'),
                h('span', null, 'Password')
              ),
              h('div', { className: 'relative' },
                h('input', {
                  type: showPassword ? 'text' : 'password',
                  required: true,
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
                  placeholder: 'Enter your password',
                  className: 'w-full bg-[#f9f3e7] px-3.5 py-2.5 pr-10 rounded-xl text-xs text-[#1d1c14] border border-[#e8e2d6] focus:outline-none focus:ring-2 focus:ring-[#fd6c19] focus:bg-white transition-all'
                }),
                h('button', {
                  type: 'button',
                  onClick: () => setShowPassword(!showPassword),
                  className: 'absolute right-3 top-1/2 -translate-y-1/2 text-[#82746e] hover:text-[#250f03]'
                },
                  h('span', { className: 'material-symbols-outlined text-base' }, showPassword ? 'visibility_off' : 'visibility')
                )
              )
            ),
            h('button', {
              type: 'submit',
              disabled: loading,
              className: 'w-full mt-2 py-3.5 px-4 rounded-xl bg-[#fd6c19] hover:bg-[#a23f00] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50'
            },
              loading
                ? [
                    h('span', { key: 'sp', className: 'material-symbols-outlined text-sm animate-spin' }, 'progress_activity'),
                    h('span', { key: 'tx' }, 'Authenticating with Salem Café...')
                  ]
                : [
                    h('span', { key: 'tx' }, 'Sign In to Account'),
                    h('span', { key: 'ic', className: 'material-symbols-outlined text-sm' }, 'arrow_forward')
                  ]
            )
          ),

          h('div', { className: 'relative my-6 text-center' },
            h('div', { className: 'absolute inset-0 flex items-center' },
              h('div', { className: 'w-full border-t border-[#ede8dc]' })
            ),
            h('span', { className: 'relative bg-white px-3 text-[11px] font-semibold text-[#82746e] uppercase tracking-wider' },
              'Or test quickly'
            )
          ),

          h('button', {
            type: 'button',
            disabled: loading,
            onClick: handleDemoLogin,
            className: 'w-full py-2.5 px-3 rounded-xl bg-[#f3ede1] hover:bg-[#ede8dc] text-[#250f03] font-bold text-xs border border-[#e8e2d6] flex items-center justify-center gap-2 transition-colors disabled:opacity-50'
          },
            h('span', { className: 'material-symbols-outlined text-[#a23f00] text-sm' }, 'badge'),
            h('span', null, '1-Click Demo Login (Karthik Subramanian)')
          ),

          h('div', { className: 'mt-6 pt-4 border-t border-[#ede8dc] text-center text-xs text-[#50443f]' },
            h('span', null, 'New to Smart Café Salem? '),
            h('button', {
              onClick: () => onNavigate('register'),
              className: 'font-bold text-[#a23f00] hover:underline'
            }, 'Create an Account')
          )
        )
      );
    }

    // 8.6. REGISTER PAGE COMPONENT
    function Register({ onNavigate, onRegisterSuccess, redirectTarget = null }) {
      const [fullName, setFullName] = useState('');
      const [email, setEmail] = useState('');
      const [phone, setPhone] = useState('');
      const [password, setPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [showPassword, setShowPassword] = useState(false);
      const [loading, setLoading] = useState(false);
      const [errorMessage, setErrorMessage] = useState(null);
      const [successMessage, setSuccessMessage] = useState(null);

      const handleSubmit = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        const cleanName = fullName.trim();
        const cleanEmail = email.trim();

        if (!cleanName) {
          setErrorMessage('Please enter your full name.');
          return;
        }
        if (!cleanEmail || cleanEmail.indexOf('@') === -1) {
          setErrorMessage('Please enter a valid email address.');
          return;
        }
        if (password.length < 6) {
          setErrorMessage('Password must be at least 6 characters long.');
          return;
        }
        if (password !== confirmPassword) {
          setErrorMessage('Passwords do not match. Please re-enter.');
          return;
        }

        const sb = getSupabase();
        if (!sb || !sb.auth) {
          setErrorMessage('Supabase auth is not available.');
          return;
        }

        setLoading(true);
        try {
          // Register with Supabase Auth & save full_name in user metadata
          // No role parameter is sent — users cannot choose their own admin role
          const { data, error } = await sb.auth.signUp({
            email: cleanEmail,
            password: password,
            options: {
              data: {
                full_name: cleanName,
                phone: phone.trim() || undefined
              }
            }
          });

          if (error) throw error;

          if (data && data.user) {
            setSuccessMessage('Account created for ' + cleanName + '! Welcome to Smart Café Salem.');
            if (onRegisterSuccess) onRegisterSuccess(data.user);

            if (data.session) {
              setTimeout(() => {
                onNavigate(redirectTarget || 'home');
              }, 800);
            } else {
              setSuccessMessage('Registration complete for ' + cleanName + '! If confirmation is required, check your email or sign in.');
              setTimeout(() => {
                onNavigate('login');
              }, 1500);
            }
          }
        } catch (err) {
          console.error('Registration error:', err);
          let msg = err.message || 'Registration failed. Please try again.';
          if (err.message && err.message.indexOf('User already registered') !== -1) {
            msg = 'An account with this email already exists. Please sign in instead.';
          }
          setErrorMessage(msg);
        } finally {
          setLoading(false);
        }
      };

      return h('div', { className: 'max-w-md mx-auto px-4 py-12 w-full' },
        h('div', { className: 'text-center mb-8' },
          h('div', { className: 'inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#f3ede1] shadow-sm mb-3' },
            h('span', { className: 'material-symbols-outlined text-[#a23f00] text-3xl' }, 'how_to_reg')
          ),
          h('h1', { className: 'font-serif text-3xl font-bold text-[#250f03]' }, 'Create Account'),
          h('p', { className: 'text-xs text-[#a23f00] font-semibold uppercase tracking-wider mt-1' },
            'Join Eswar, Bala & Co • Salem Kaapi Club'
          )
        ),

        errorMessage && h('div', { className: 'mb-6 bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl flex items-start gap-2.5 text-xs' },
          h('span', { className: 'material-symbols-outlined text-red-600 text-base shrink-0 mt-0.5' }, 'error'),
          h('div', { className: 'flex-1' }, errorMessage),
          h('button', { onClick: () => setErrorMessage(null), className: 'text-red-700 font-bold hover:underline shrink-0' }, '✕')
        ),

        successMessage && h('div', { className: 'mb-6 bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl flex items-center gap-2.5 text-xs' },
          h('span', { className: 'material-symbols-outlined text-emerald-600 text-base' }, 'check_circle'),
          h('span', { className: 'font-medium' }, successMessage)
        ),

        h('div', { className: 'bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-[#e8e2d6]' },
          h('form', { onSubmit: handleSubmit, className: 'flex flex-col gap-4' },
            h('div', { className: 'flex flex-col gap-1.5' },
              h('label', { className: 'text-xs font-bold text-[#250f03] flex items-center gap-1.5' },
                h('span', { className: 'material-symbols-outlined text-sm text-[#a23f00]' }, 'person'),
                h('span', null, 'Full Name *')
              ),
              h('input', {
                type: 'text',
                required: true,
                autoFocus: true,
                value: fullName,
                onChange: (e) => setFullName(e.target.value),
                placeholder: 'e.g. Karthik Subramanian',
                className: 'w-full bg-[#f9f3e7] px-3.5 py-2.5 rounded-xl text-xs text-[#1d1c14] border border-[#e8e2d6] focus:outline-none focus:ring-2 focus:ring-[#fd6c19] focus:bg-white transition-all'
              })
            ),
            h('div', { className: 'flex flex-col gap-1.5' },
              h('label', { className: 'text-xs font-bold text-[#250f03] flex items-center gap-1.5' },
                h('span', { className: 'material-symbols-outlined text-sm text-[#a23f00]' }, 'mail'),
                h('span', null, 'Email Address *')
              ),
              h('input', {
                type: 'email',
                required: true,
                value: email,
                onChange: (e) => setEmail(e.target.value),
                placeholder: 'e.g. karthik.salem@gmail.com',
                className: 'w-full bg-[#f9f3e7] px-3.5 py-2.5 rounded-xl text-xs text-[#1d1c14] border border-[#e8e2d6] focus:outline-none focus:ring-2 focus:ring-[#fd6c19] focus:bg-white transition-all'
              })
            ),
            h('div', { className: 'flex flex-col gap-1.5' },
              h('label', { className: 'text-xs font-bold text-[#250f03] flex items-center gap-1.5' },
                h('span', { className: 'material-symbols-outlined text-sm text-[#a23f00]' }, 'call'),
                h('span', null, 'Mobile Number (Optional)')
              ),
              h('input', {
                type: 'tel',
                value: phone,
                onChange: (e) => setPhone(e.target.value),
                placeholder: 'e.g. +91 94432 10890',
                className: 'w-full bg-[#f9f3e7] px-3.5 py-2.5 rounded-xl text-xs text-[#1d1c14] border border-[#e8e2d6] focus:outline-none focus:ring-2 focus:ring-[#fd6c19] focus:bg-white transition-all'
              })
            ),
            h('div', { className: 'flex flex-col gap-1.5' },
              h('label', { className: 'text-xs font-bold text-[#250f03] flex items-center gap-1.5' },
                h('span', { className: 'material-symbols-outlined text-sm text-[#a23f00]' }, 'lock'),
                h('span', null, 'Password * (min. 6 characters)')
              ),
              h('div', { className: 'relative' },
                h('input', {
                  type: showPassword ? 'text' : 'password',
                  required: true,
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
                  placeholder: 'Choose a secure password',
                  className: 'w-full bg-[#f9f3e7] px-3.5 py-2.5 pr-10 rounded-xl text-xs text-[#1d1c14] border border-[#e8e2d6] focus:outline-none focus:ring-2 focus:ring-[#fd6c19] focus:bg-white transition-all'
                }),
                h('button', {
                  type: 'button',
                  onClick: () => setShowPassword(!showPassword),
                  className: 'absolute right-3 top-1/2 -translate-y-1/2 text-[#82746e] hover:text-[#250f03]'
                },
                  h('span', { className: 'material-symbols-outlined text-base' }, showPassword ? 'visibility_off' : 'visibility')
                )
              )
            ),
            h('div', { className: 'flex flex-col gap-1.5' },
              h('label', { className: 'text-xs font-bold text-[#250f03] flex items-center gap-1.5' },
                h('span', { className: 'material-symbols-outlined text-sm text-[#a23f00]' }, 'verified'),
                h('span', null, 'Confirm Password *')
              ),
              h('input', {
                type: showPassword ? 'text' : 'password',
                required: true,
                value: confirmPassword,
                onChange: (e) => setConfirmPassword(e.target.value),
                placeholder: 'Re-enter your password',
                className: 'w-full bg-[#f9f3e7] px-3.5 py-2.5 rounded-xl text-xs text-[#1d1c14] border border-[#e8e2d6] focus:outline-none focus:ring-2 focus:ring-[#fd6c19] focus:bg-white transition-all'
              })
            ),
            h('button', {
              type: 'submit',
              disabled: loading,
              className: 'w-full mt-2 py-3.5 px-4 rounded-xl bg-[#fd6c19] hover:bg-[#a23f00] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50'
            },
              loading
                ? [
                    h('span', { key: 'sp', className: 'material-symbols-outlined text-sm animate-spin' }, 'progress_activity'),
                    h('span', { key: 'tx' }, 'Creating Your Account...')
                  ]
                : [
                    h('span', { key: 'tx' }, 'Register Account'),
                    h('span', { key: 'ic', className: 'material-symbols-outlined text-sm' }, 'arrow_forward')
                  ]
            )
          ),
          h('div', { className: 'mt-6 pt-4 border-t border-[#ede8dc] text-center text-xs text-[#50443f]' },
            h('span', null, 'Already have an account? '),
            h('button', {
              onClick: () => onNavigate('login'),
              className: 'font-bold text-[#a23f00] hover:underline'
            }, 'Sign In here')
          )
        )
      );
    }`;

// 3. Updated App Component with Supabase session state, profile fetch, page protection, and login/register routes
const updatedAppCode = `    // 9. APP ROOT (WITH SUPABASE AUTHENTICATION & PROFILE INTEGRATION)
    function App() {
      const [activePage, setActivePage] = useState('home');

      // Customer Auth & Profile state
      const [currentUser, setCurrentUser] = useState(null);
      const [customerProfile, setCustomerProfile] = useState(null);
      const [authLoading, setAuthLoading] = useState(true);
      const [redirectAfterAuth, setRedirectAfterAuth] = useState(null);
      const [redirectNotice, setRedirectNotice] = useState(null);
      const [globalBanner, setGlobalBanner] = useState(null);

      const [cart, setCart] = useState(() => {
        try {
          const saved = localStorage.getItem('react_smart_cafe_cart');
          return saved ? JSON.parse(saved) : INITIAL_CART;
        } catch (e) {
          return INITIAL_CART;
        }
      });

      const [orders, setOrders] = useState(() => {
        try {
          const saved = localStorage.getItem('react_smart_cafe_orders');
          return saved ? JSON.parse(saved) : INITIAL_ORDERS;
        } catch (e) {
          return INITIAL_ORDERS;
        }
      });

      // Fetch customer profile from PostgreSQL profiles table
      const fetchProfile = async (userId) => {
        const sb = getSupabase();
        if (!sb) return;
        try {
          const { data, error } = await sb
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

          if (!error && data) {
            setCustomerProfile(data);
          }
        } catch (err) {
          console.warn('Profiles table query notice:', err);
        }
      };

      // Listen to Supabase Auth session & state changes
      useEffect(() => {
        const sb = getSupabase();
        if (!sb || !sb.auth) {
          setAuthLoading(false);
          return;
        }

        // 1. Get initial session
        sb.auth.getSession().then(({ data }) => {
          const session = data && data.session;
          const user = session ? session.user : null;
          setCurrentUser(user);
          if (user) {
            fetchProfile(user.id);
          }
          setAuthLoading(false);
        }).catch(() => setAuthLoading(false));

        // 2. Subscribe to auth changes
        const { data: authSub } = sb.auth.onAuthStateChange(async (event, session) => {
          const user = session ? session.user : null;
          setCurrentUser(user);
          if (user) {
            fetchProfile(user.id);
          } else {
            setCustomerProfile(null);
          }

          if (event === 'SIGNED_IN') {
            const name = (user && user.user_metadata && user.user_metadata.full_name) || (user && user.email) || 'Customer';
            setGlobalBanner('Signed in as ' + name);
            setTimeout(() => setGlobalBanner(null), 3500);
          } else if (event === 'SIGNED_OUT') {
            setCustomerProfile(null);
          }
        });

        return () => {
          if (authSub && authSub.subscription) {
            authSub.subscription.unsubscribe();
          }
        };
      }, []);

      useEffect(() => {
        try {
          localStorage.setItem('react_smart_cafe_cart', JSON.stringify(cart));
        } catch (e) {}
      }, [cart]);

      useEffect(() => {
        try {
          localStorage.setItem('react_smart_cafe_orders', JSON.stringify(orders));
        } catch (e) {}
      }, [orders]);

      // Protected Navigation Handler (Protects checkout and orders pages)
      const handleNavigate = (targetPage) => {
        if ((targetPage === 'checkout' || targetPage === 'orders') && !currentUser) {
          setRedirectAfterAuth(targetPage);
          setRedirectNotice(
            targetPage === 'checkout'
              ? 'Customer sign in is required to finalize your order.'
              : 'Please sign in to view your live orders and delivery tracking.'
          );
          setActivePage('login');
          return;
        }

        setRedirectNotice(null);
        setActivePage(targetPage);
      };

      // Customer Logout
      const handleLogout = async () => {
        const sb = getSupabase();
        if (sb && sb.auth) {
          try {
            await sb.auth.signOut();
          } catch (err) {
            console.error('Logout error:', err);
          }
        }
        setCurrentUser(null);
        setCustomerProfile(null);
        setGlobalBanner('You have been logged out successfully.');
        setTimeout(() => setGlobalBanner(null), 3500);
        setActivePage('home');
      };

      const playTone = () => {
        try {
          const ctx = new (window.AudioContext || window.webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(587.33, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        } catch (e) {}
      };

      const handleAddToCart = (item) => {
        setCart((prev) => {
          const existing = prev.find((i) => i.id === item.id);
          if (existing) {
            return prev.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
          }
          return [...prev, { id: item.id, name: item.name, price: item.price, qty: 1 }];
        });
        playTone();
      };

      const handleUpdateQty = (id, delta) => {
        setCart((prev) =>
          prev
            .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
            .filter((item) => item.qty > 0)
        );
      };

      const handleClearCart = () => setCart([]);

      const handlePlaceOrder = (orderPayload) => {
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const tokenNumber = '' + Math.floor(100 + Math.random() * 900);
        const newOrder = {
          ...orderPayload,
          id: orderPayload.order_number || ('#SC-SLM-' + randomSuffix),
          token_number: orderPayload.token_number || tokenNumber,
          pin: orderPayload.token_number || tokenNumber,
          status: orderPayload.status || 'PREPARING 🔥',
          createdAt: orderPayload.createdAt || new Date().toISOString(),
          runner: { name: 'Muthu Kumaran', phone: '+91 94432 10890' }
        };
        setOrders((prev) => [newOrder, ...prev]);
        setCart([]);
      };

      const handleUpdateStatus = (orderId, newStatus) => {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
        );
      };

      const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

      return h('div', { className: 'min-h-screen bg-[#fff9ed] text-[#1d1c14] flex flex-col justify-between font-sans' },
        h(Navbar, {
          activePage: activePage,
          setActivePage: handleNavigate,
          cartCount: totalCartCount,
          currentUser: currentUser,
          customerProfile: customerProfile,
          onLogout: handleLogout
        }),

        // Global Banner
        globalBanner && h('div', { className: 'fixed top-24 right-4 z-50 bg-[#250f03] text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs border border-[#fd6c19]' },
          h('span', { className: 'material-symbols-outlined text-[#fd6c19] text-base' }, 'check_circle'),
          h('span', null, globalBanner)
        ),

        h('main', { className: 'flex-1 w-full pt-28' },
          activePage === 'home' && h(Home, {
            onNavigate: handleNavigate,
            onAddToCart: handleAddToCart
          }),
          activePage === 'menu' && h(Menu, {
            cart: cart,
            onAddToCart: handleAddToCart,
            onUpdateQty: handleUpdateQty,
            onClearCart: handleClearCart,
            onNavigate: handleNavigate
          }),
          activePage === 'cart' && h('div', { className: 'max-w-3xl mx-auto px-4 py-8' },
            h('h1', { className: 'font-serif text-3xl font-bold text-[#250f03] mb-6' }, 'Your Basket & Kaapi Tray'),
            h(Cart, {
              cart: cart,
              onUpdateQty: handleUpdateQty,
              onClear: handleClearCart,
              onProceed: () => handleNavigate('checkout'),
              isSidebar: false
            })
          ),
          activePage === 'checkout' && h(Checkout, {
            cart: cart,
            onPlaceOrder: handlePlaceOrder,
            onNavigate: handleNavigate
          }),
          (activePage === 'orders' || activePage === 'admin') && h(Orders, {
            orders: orders,
            onUpdateStatus: handleUpdateStatus,
            onNavigate: handleNavigate
          }),
          activePage === 'login' && h(Login, {
            onNavigate: setActivePage,
            redirectTarget: redirectAfterAuth,
            redirectNotice: redirectNotice,
            onLoginSuccess: (user) => {
              setCurrentUser(user);
              fetchProfile(user.id);
            }
          }),
          activePage === 'register' && h(Register, {
            onNavigate: setActivePage,
            redirectTarget: redirectAfterAuth,
            onRegisterSuccess: (user) => {
              setCurrentUser(user);
              fetchProfile(user.id);
            }
          })
        ),
        h('footer', { className: 'w-full bg-[#f3ede1] mt-12 py-8 px-4 md:px-8 border-t border-[#e8e2d6] text-xs text-[#50443f]' },
          h('div', { className: 'max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4' },
            h('p', null, '© 2025 Eswar, Bala & Co. Salem Junction & NH44 Rest Stop.'),
            h('div', { className: 'flex items-center gap-4' },
              h('button', { onClick: () => handleNavigate('home'), className: 'hover:text-[#a23f00]' }, 'Home'),
              h('button', { onClick: () => handleNavigate('menu'), className: 'hover:text-[#a23f00]' }, 'Menu'),
              h('button', { onClick: () => handleNavigate('orders'), className: 'hover:text-[#a23f00]' }, 'Order Tracking'),
              h('button', { onClick: () => handleNavigate('admin'), className: 'hover:text-[#a23f00]' }, 'Staff Portal'),
              currentUser
                ? h('button', { onClick: handleLogout, className: 'text-red-700 font-bold hover:underline' }, 'Log Out')
                : h('button', { onClick: () => handleNavigate('login'), className: 'hover:text-[#a23f00] font-bold' }, 'Sign In')
            )
          )
        )
      );
    }`;

// Replace Navbar in build_bundle.js
const navStart = code.indexOf('    // 2. NAVBAR COMPONENT');
const navEnd = code.indexOf('    // 3. MENU CARD COMPONENT');

if (navStart === -1 || navEnd === -1) {
  console.error('Navbar markers not found in build_bundle.js', { navStart, navEnd });
  process.exit(1);
}

code = code.slice(0, navStart) + updatedNavbarCode + '\n\n' + code.slice(navEnd);

// Replace App in build_bundle.js and insert Login & Register right before App
const appStart = code.indexOf('    // 9. APP ROOT');
const appEnd = code.indexOf('    // 10. MOUNT REACT APP ROBUSTLY');

if (appStart === -1 || appEnd === -1) {
  console.error('App markers not found in build_bundle.js', { appStart, appEnd });
  process.exit(1);
}

const newComponentsAndApp = loginComponentCode + '\n\n' + updatedAppCode + '\n\n';
code = code.slice(0, appStart) + newComponentsAndApp + code.slice(appEnd);

fs.writeFileSync(bundlePath, code, 'utf8');
console.log('✔ Successfully updated build_bundle.js with Stage 6 Customer Authentication!');
