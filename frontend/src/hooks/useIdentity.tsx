import {
  createContext,
  ParentComponent,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';

interface UserDTO {
  username: string;
}

interface IdentityProviderShape {
  login: (arg0: string, arg1: string) => Promise<any>;
  logout: () => Promise<any>;
  token: string | null;
  user: UserDTO | null;
}

const TOKEN = 'alewife-jwt';

const IdentityContext = createContext<IdentityProviderShape>({
  login: () => Promise.reject('no <IdentityProvider> found'),
  logout: () => Promise.reject('no <IdentityProvider> found'),
  token: null,
  user: null
});

const IdentityProvider: ParentComponent = ({ children }) => {
  const [ token, setToken ] = useState<string | null>(localStorage.getItem(TOKEN));
  const [ user, setUser ] = useState<UserDTO | null>(null);
  const login = useCallback(async (username: string, password: string) => {
    const response = await window.fetch('/api/1/auth/login', {
      body: JSON.stringify({ password, username }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    })
    const obj = await response.json();

    setToken(obj.token);
  }, []);
  const logout = useCallback(async () => {
    localStorage.removeItem(TOKEN);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) {
      return;
    }

    localStorage.setItem(TOKEN, token);

    window.fetch('/api/1/my/info', {
      headers: {
        'X-JWT': token
      }
    })
      .then((res) => res.json())
      .then(setUser);

    const handle = setTimeout(() => {
      window.fetch('/api/1/auth/refresh', {
        headers: {
          'X-JWT': token
        }
      })
        .then((res) => res.json())
        .then((data) => setToken(data.token));
    }, 1000 * 60 * 10);

    return function cleanup() {
      clearTimeout(handle);
    };
  }, [ token ]);

  return (
    <IdentityContext.Provider value={{ login, logout, token, user }}>
      {children}
    </IdentityContext.Provider>
  );
};

const useIdentity = () => useContext(IdentityContext);

export {
  IdentityProvider,
  useIdentity
};
