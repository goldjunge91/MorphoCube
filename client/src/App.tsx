import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import BasicAuthPage from "@/pages/basic-auth-page";

// Render only the auth page for now
function App() {
  return (
    <>
      <Toaster />
      <Switch>
        <Route path="/auth" component={BasicAuthPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

export default App;
