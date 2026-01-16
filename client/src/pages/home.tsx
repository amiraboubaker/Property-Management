import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

interface Property {
    id: string;
    title: string;
    description?: string;
    price: number;
    location: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    type: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export default function Home() {
    const { data: properties, isLoading, error } = useQuery<Property[]>({
        queryKey: ["properties"],
        queryFn: async () => {
            const response = await fetch("/api/properties");
            if (!response.ok) throw new Error("Failed to fetch properties");
            return response.json();
        },
    });

    return (
        <div className="min-h-screen w-full p-4 bg-gray-50">
            <div className="max-w-6xl mx-auto space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome to Property 360</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-gray-600 mb-4">
                            Your property management application is running successfully!
                        </p>
                        <div className="space-y-2 text-sm">
                            <p><strong>API Endpoints:</strong></p>
                            <ul className="list-disc list-inside space-y-1 text-gray-600">
                                <li>GET /api/properties - List all properties</li>
                                <li>POST /api/properties - Create a new property</li>
                                <li>GET /api/properties/:id - Get property by ID</li>
                                <li>PUT /api/properties/:id - Update property</li>
                                <li>DELETE /api/properties/:id - Delete property</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Properties ({properties?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoading && <p>Loading properties...</p>}
                        {error && <p className="text-red-500">Error loading properties</p>}
                        {!isLoading && !error && properties && properties.length === 0 && (
                            <p className="text-gray-500">No properties found. Add some using the API!</p>
                        )}
                        {properties && properties.length > 0 && (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {properties.map((property) => (
                                    <Card key={property.id} className="p-4">
                                        <h3 className="font-semibold">{property.title}</h3>
                                        <p className="text-sm text-gray-600">{property.location}</p>
                                        <p className="text-lg font-bold text-green-600">
                                            ${property.price.toLocaleString()}
                                        </p>
                                        <p className="text-sm text-gray-500 capitalize">
                                            {property.type} • {property.status}
                                        </p>
                                        {property.bedrooms && (
                                            <p className="text-sm">{property.bedrooms} bed</p>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}