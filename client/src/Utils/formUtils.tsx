export function areAllFieldsFilled(obj: Record<string, string>) {
  return Object.values(obj).every(value => value.trim() !== "");
}
export function handleInputChange<T>(
  state: T,
  setState: React.Dispatch<React.SetStateAction<T>>
) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };
}
