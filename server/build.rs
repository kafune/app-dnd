// O frontend (dist/) é embutido no binário. Garante que qualquer arquivo novo,
// removido ou alterado em dist/ dispare uma recompilação.
fn main() {
    println!("cargo:rerun-if-changed=../dist");
}
