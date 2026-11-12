const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
}

Deno.serve(async (request: Request) => {
    if (request.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    if (request.method !== "POST") {
        return jsonResponse({ error: "Método não permitido." }, 405);
    }

    const duffelToken = Deno.env.get("DUFFEL_API_TOKEN");
    if (!duffelToken) {
        return jsonResponse({ error: "A busca de voos ainda não foi configurada no servidor." }, 503);
    }

    let search: {
        origin?: unknown;
        destination?: unknown;
        departureDate?: unknown;
        passengers?: unknown;
    };

    try {
        search = await request.json();
    } catch {
        return jsonResponse({ error: "Não foi possível ler os dados da busca." }, 400);
    }

    const { origin, destination, departureDate, passengers } = search;
    const today = new Date().toISOString().slice(0, 10);
    const parsedDepartureDate = typeof departureDate === "string"
        ? new Date(`${departureDate}T00:00:00.000Z`)
        : null;
    if (
        typeof origin !== "string" ||
        !/^[A-Z]{3}$/.test(origin) ||
        typeof destination !== "string" ||
        !/^[A-Z]{3}$/.test(destination) ||
        origin === destination ||
        typeof departureDate !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(departureDate) ||
        !parsedDepartureDate ||
        Number.isNaN(parsedDepartureDate.getTime()) ||
        parsedDepartureDate.toISOString().slice(0, 10) !== departureDate ||
        departureDate < today ||
        typeof passengers !== "number" ||
        !Number.isInteger(passengers) ||
        passengers < 1 ||
        passengers > 9
    ) {
        return jsonResponse({ error: "Confira os aeroportos, a data e o número de passageiros." }, 400);
    }

    const duffelResponse = await fetch("https://api.duffel.com/air/offer_requests?return_offers=true", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${duffelToken}`,
            "Duffel-Version": "v2",
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            data: {
                slices: [{
                    origin,
                    destination,
                    departure_date: departureDate,
                }],
                cabin_class: "economy",
                passengers: Array.from({ length: passengers }, () => ({ type: "adult" })),
            },
        }),
    });

    if (!duffelResponse.ok) {
        console.error("Duffel offer search failed:", duffelResponse.status);
        return jsonResponse({ error: "O fornecedor de voos não conseguiu concluir a busca. Tente novamente." }, 502);
    }

    const result = await duffelResponse.json();
    return jsonResponse({ data: result.data?.offers ?? [] });
});
