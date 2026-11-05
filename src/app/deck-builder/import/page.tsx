import Container from "@/components/ui/Container";

import ImportDeckPanel from "@/components/deck-builder/ImportDeckPanel";

export default function ImportDeckPage() {
  return (
    <main className="py-8">
      <Container>
        <ImportDeckPanel />
      </Container>
    </main>
  );
}